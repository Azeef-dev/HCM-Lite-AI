import PayrollRun from "../models/PayrollRun.js";
import Payslip from "../models/Payslip.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generatePayrollDraft } from "../services/payrollService.js";
import { logAudit } from "../services/auditService.js";
import { generatePayslipPdf } from "../services/pdfService.js";
import { createNotification } from "../services/notificationService.js";

export const createPayrollRun = asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const run = await generatePayrollDraft(Number(month), Number(year), req.user);
    await logAudit({ actor: req.user, action: "create", entity: "PayrollRun", entityId: run._id, after: run });
    res.status(201).json(run);
});

export const listPayrollRuns = asyncHandler(async (req, res) => {
    const runs = await PayrollRun.find().sort({ year: -1, month: -1 });
    res.json(runs);
});

export const getPayrollRun = asyncHandler(async (req, res) => {
    const run = await PayrollRun.findById(req.params.id);
    if (!run) return res.status(404).json({ message: "Not found" });

    const payslips = await Payslip.find({ payrollRun: run._id }).populate("employee", "name employeeCode department");
    res.json({ run, payslips });
});

export const finalizePayrollRun = asyncHandler(async (req, res) => {
    const run = await PayrollRun.findById(req.params.id);
    if (!run) return res.status(404).json({ message: "Not found" });
    if (run.status === "finalized") return res.status(400).json({ message: "Already finalized" });

    const before = run.toObject();
    run.status = "finalized";
    run.finalizedBy = req.user.id;
    run.finalizedAt = new Date();
    await run.save();

    await logAudit({ actor: req.user, action: "finalize", entity: "PayrollRun", entityId: run._id, before, after: run });

    const payslips = await Payslip.find({ payrollRun: run._id }).populate("employee");
    for (const slip of payslips) {
        const user = await User.findOne({ employee: slip.employee._id });
        if (user) {
            await createNotification({
                user: user._id,
                title: "Payslip available",
                message: `Your payslip for ${run.month}/${run.year} is ready.`,
                type: "payslip",
            });
        }
    }

    res.json(run);
});

export const getMyPayslips = asyncHandler(async (req, res) => {
    const slips = await Payslip.find({ employee: req.user.employeeId })
        .populate({ path: "payrollRun", match: { status: "finalized" } })
        .sort({ year: -1, month: -1 });

    res.json(slips.filter((s) => s.payrollRun));
});

export const downloadPayslipPdf = asyncHandler(async (req, res) => {
    const slip = await Payslip.findById(req.params.id).populate("employee").populate("payrollRun");
    if (!slip) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "employee") {
        if (slip.employee._id.toString() !== req.user.employeeId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (slip.payrollRun.status !== "finalized") {
            return res.status(403).json({ message: "Payslip not finalized yet" });
        }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=payslip-${slip.employee.employeeCode}-${slip.month}-${slip.year}.pdf`);
    generatePayslipPdf(slip, res);
});