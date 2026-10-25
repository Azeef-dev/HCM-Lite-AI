import Announcement from "../models/Announcement.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";

export const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, message, audience } = req.body;
    const companyId = req.user?.companyId || null;

    const announcement = await Announcement.create({
        company: companyId,
        title,
        message,
        audience: audience || "all",
        postedBy: req.user.id,
    });

    await logAudit({
        actor: req.user,
        action: "create",
        entity: "Announcement",
        entityId: announcement._id,
        after: announcement,
        companyId,
    });

    const populated = await Announcement.findById(announcement._id).populate("postedBy", "name role");
    res.status(201).json(populated);
});

export const listAnnouncements = asyncHandler(async (req, res) => {
    const companyId = req.user?.companyId;
    const filter = {};
    if (companyId) filter.company = companyId;

    if (req.user.role !== "admin" && req.user.role !== "hr") {
        filter.audience = { $in: ["all", "employee"] };
    }

    const announcements = await Announcement.find(filter)
        .populate("postedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(50);

    res.json(announcements);
});

export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true },
        { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Not found" });
    res.json(notification);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
});

export const getAuditLog = asyncHandler(async (req, res) => {
    const { entity, action, page = 1, limit = 20 } = req.query;
    const companyId = req.user?.companyId;

    const filter = {};
    if (companyId) filter.company = companyId;
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).populate("actor", "name role email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(filter),
    ]);

    res.json({ data: logs, total, page: Number(page), pages: Math.ceil(total / limit) });
});
