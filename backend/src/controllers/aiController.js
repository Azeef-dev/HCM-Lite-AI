import AiLog from "../models/AiLog.js";
import LeaveType from "../models/LeaveType.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAssistant, summarizeDashboard, parseSmartLeave } from "../services/aiService.js";

const RATE_LIMIT_PER_HOUR = Number(process.env.AI_RATE_LIMIT_PER_HOUR || 20);

const checkRateLimit = async (userId) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await AiLog.countDocuments({ user: userId, createdAt: { $gte: oneHourAgo } });
    return count < RATE_LIMIT_PER_HOUR;
};

export const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: "message is required" });

    if (!(await checkRateLimit(req.user.id))) {
        return res.status(429).json({ message: "AI request limit reached for this hour. Please try again later." });
    }

    const ctx = { role: req.user.role, employeeId: req.user.employeeId, userId: req.user.id };
    const logEntry = { user: req.user.id, role: req.user.role, feature: "chat", prompt: message };

    try {
        const { content, toolsUsed } = await runAssistant(message, ctx);
        await AiLog.create({ ...logEntry, toolsUsed, response: content });
        res.json({ answer: content, aiGenerated: true });
    } catch (err) {
        await AiLog.create({ ...logEntry, success: false, errorMessage: err.message });
        res.status(503).json({ message: "AI assistant is unavailable right now. Please try again shortly.", aiGenerated: false });
    }
});

export const dashboardSummary = asyncHandler(async (req, res) => {
    const { kpis } = req.body;
    if (!kpis) return res.status(400).json({ message: "kpis JSON is required" });
    if (!(await checkRateLimit(req.user.id))) return res.status(429).json({ message: "AI request limit reached for this hour." });

    try {
        const content = await summarizeDashboard(kpis);
        await AiLog.create({ user: req.user.id, role: req.user.role, feature: "dashboard_summary", prompt: JSON.stringify(kpis), response: content });
        res.json({ summary: content, aiGenerated: true });
    } catch (err) {
        await AiLog.create({ user: req.user.id, role: req.user.role, feature: "dashboard_summary", success: false, errorMessage: err.message });
        res.status(503).json({ message: "AI summary unavailable right now." });
    }
});

export const smartLeave = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "text is required" });
    if (!(await checkRateLimit(req.user.id))) return res.status(429).json({ message: "AI request limit reached for this hour." });

    const leaveTypes = await LeaveType.find();
    try {
        const parsed = await parseSmartLeave(text, leaveTypes);
        const matchedType = leaveTypes.find((lt) => lt.name.toLowerCase() === String(parsed.leaveType).toLowerCase());

        await AiLog.create({ user: req.user.id, role: req.user.role, feature: "smart_leave", prompt: text, response: JSON.stringify(parsed) });

        res.json({
            draft: {
                leaveTypeId: matchedType?._id || null,
                leaveTypeName: matchedType?.name || parsed.leaveType,
                startDate: parsed.startDate,
                endDate: parsed.endDate,
                reason: parsed.reason,
            },
            aiGenerated: true,
            note: "Please review and confirm before submitting.",
        });
    } catch (err) {
        await AiLog.create({ user: req.user.id, role: req.user.role, feature: "smart_leave", prompt: text, success: false, errorMessage: err.message });
        res.status(503).json({ message: "Could not understand the request. Please fill the leave form manually." });
    }
});