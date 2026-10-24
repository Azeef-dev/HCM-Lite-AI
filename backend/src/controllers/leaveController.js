import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";
import Holiday from "../models/Holiday.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateAndCreateLeave, getBalanceForEmployee } from "../services/leaveService.js";
import { logAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";

const getCtx = async () => {
    const [company, holidays] = await Promise.all([Company.findOne(), Holiday.find()]);
    return { company: company || { weekends: [0, 6] }, holidays };
};

export const applyLeave = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { leaveTypeId, startDate, endDate, reason } = req.body;

    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) return res.status(404).json({ message: "Leave type not found" });

    const { company, holidays } = await getCtx();
    const request = await validateAndCreateLeave({ employeeId, leaveType, startDate, endDate, reason, company, holidays });
    res.status(201).json(request);
});

export const cancelLeave = asyncHandler(async (req, res) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Not found" });
    if (leave.employee.toString() !== req.user.employeeId) return res.status(403).json({ message: "Forbidden" });
    if (!["pending", "approved"].includes(leave.status)) return res.status(400).json({ message: "Cannot cancel this leave" });
    leave.status = "cancelled";
    await leave.save();
    res.json(leave);
});

export const getMyLeaves = asyncHandler(async (req, res) => {
    const leaves = await LeaveRequest.find({ employee: req.user.employeeId }).populate("leaveType").sort({ createdAt: -1 });
    res.json(leaves);
});

export const getMyBalance = asyncHandler(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const leaveTypes = await LeaveType.find();
    const balance = await getBalanceForEmployee(req.user.employeeId, leaveTypes, year);
    res.json(balance);
});

export const listPendingLeaves = asyncHandler(async (req, res) => {
    const leaves = await LeaveRequest.find({ status: "pending" })
        .populate("leaveType")
        .populate({ path: "employee", select: "name employeeCode department", populate: "department" })
        .sort({ createdAt: 1 });
    res.json(leaves);
});

export const listAllLeaves = asyncHandler(async (req, res) => {
    const { status, employee, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    let leaves = await LeaveRequest.find(filter)
        .populate("leaveType")
        .populate({ path: "employee", select: "name employeeCode department", populate: "department" })
        .sort({ createdAt: -1 });

    if (department) leaves = leaves.filter((l) => l.employee?.department?._id?.toString() === department);
    res.json(leaves);
});

export const approveLeave = asyncHandler(async (req, res) => {
    const leave = await LeaveRequest.findById(req.params.id).populate("leaveType");
    if (!leave || leave.status !== "pending") return res.status(404).json({ message: "No pending leave request found" });

    const before = leave.toObject();
    leave.status = "approved";
    leave.approvedBy = req.user.id;
    leave.comment = req.body.comment || "";
    await leave.save();

    await logAudit({ actor: req.user, action: "approve", entity: "LeaveRequest", entityId: leave._id, before, after: leave });

    const user = await User.findOne({ employee: leave.employee });
    if (user) {
        await createNotification({
            user: user._id,
            title: "Leave approved",
            message: `Your ${leave.leaveType.name} leave (${leave.days} day(s)) has been approved.`,
            type: "leave",
        });
    }

    res.json(leave);
});

export const rejectLeave = asyncHandler(async (req, res) => {
    const leave = await LeaveRequest.findById(req.params.id).populate("leaveType");
    if (!leave || leave.status !== "pending") return res.status(404).json({ message: "No pending leave request found" });

    const before = leave.toObject();
    leave.status = "rejected";
    leave.approvedBy = req.user.id;
    leave.comment = req.body.comment || "";
    await leave.save();

    await logAudit({ actor: req.user, action: "reject", entity: "LeaveRequest", entityId: leave._id, before, after: leave });

    const user = await User.findOne({ employee: leave.employee });
    if (user) {
        await createNotification({
            user: user._id,
            title: "Leave rejected",
            message: `Your ${leave.leaveType.name} leave request was rejected.${leave.comment ? " Reason: " + leave.comment : ""}`,
            type: "leave",
        });
    }

    res.json(leave);
});