import Company from "../models/Company.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import LeaveType from "../models/LeaveType.js";
import Holiday from "../models/Holiday.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTempPassword } from "../utils/generatePassword.js";
import { logAudit } from "../services/auditService.js";

// ---- Company settings ----
export const getCompanySettings = asyncHandler(async (req, res) => {
    const company = await Company.findOne();
    res.json(company);
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
    const before = await Company.findOne();
    const updated = await Company.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    await logAudit({ actor: req.user, action: "update", entity: "Company", entityId: updated._id, before, after: updated });
    res.json(updated);
});

// ---- Departments ----
export const listDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
});

export const createDepartment = asyncHandler(async (req, res) => {
    const dept = await Department.create(req.body);
    await logAudit({ actor: req.user, action: "create", entity: "Department", entityId: dept._id, after: dept });
    res.status(201).json(dept);
});

export const updateDepartment = asyncHandler(async (req, res) => {
    const before = await Department.findById(req.params.id);
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit({ actor: req.user, action: "update", entity: "Department", entityId: dept._id, before, after: dept });
    res.json(dept);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ---- Designations ----
export const listDesignations = asyncHandler(async (req, res) => {
    const designations = await Designation.find().populate("department").sort({ title: 1 });
    res.json(designations);
});

export const createDesignation = asyncHandler(async (req, res) => {
    const designation = await Designation.create(req.body);
    res.status(201).json(designation);
});

export const updateDesignation = asyncHandler(async (req, res) => {
    const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(designation);
});

export const deleteDesignation = asyncHandler(async (req, res) => {
    await Designation.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ---- Leave Types ----
export const listLeaveTypes = asyncHandler(async (req, res) => {
    const types = await LeaveType.find().sort({ name: 1 });
    res.json(types);
});

export const createLeaveType = asyncHandler(async (req, res) => {
    const type = await LeaveType.create(req.body);
    res.status(201).json(type);
});

export const updateLeaveType = asyncHandler(async (req, res) => {
    const type = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(type);
});

export const deleteLeaveType = asyncHandler(async (req, res) => {
    await LeaveType.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ---- Holidays ----
export const listHolidays = asyncHandler(async (req, res) => {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
});

export const createHoliday = asyncHandler(async (req, res) => {
    const holiday = await Holiday.create(req.body);
    res.status(201).json(holiday);
});

export const deleteHoliday = asyncHandler(async (req, res) => {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ---- HR Users (Admin only) ----
export const createHrUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const tempPassword = generateTempPassword();

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: tempPassword,
        role: "hr",
        mustChangePassword: true,
    });

    await logAudit({ actor: req.user, action: "create", entity: "User(HR)", entityId: user._id, after: { name, email } });

    res.status(201).json({
        message: "HR account created",
        user: { id: user._id, name: user.name, email: user.email },
        tempPassword, // demo purpose: show it so the team can log in; in real life, email it
    });
});

export const listUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $in: ["hr", "employee"] } };
    const users = await User.find(filter).select("-password").populate("employee");
    res.json(users);
});

export const setUserActive = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
    await logAudit({ actor: req.user, action: "update", entity: "User", entityId: user._id, after: { isActive: user.isActive } });
    res.json(user);
});

export const resetUserPassword = asyncHandler(async (req, res) => {
    const tempPassword = generateTempPassword();
    const user = await User.findById(req.params.id);
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();
    await logAudit({ actor: req.user, action: "update", entity: "User", entityId: user._id, after: { action: "password reset" } });
    res.json({ message: "Password reset", tempPassword });
});