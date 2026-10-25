import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";
import PayrollRun from "../models/PayrollRun.js";
import { normalizeDate } from "./calendarService.js";
import { getBalanceForEmployee } from "./leaveService.js";

export const get_headcount = async ({ department } = {}, ctx = {}) => {
    const filter = { status: { $ne: "inactive" } };
    if (ctx.companyId) filter.company = ctx.companyId;
    if (department) filter.department = department;
    const count = await Employee.countDocuments(filter);
    return { headcount: count, department: department || "all" };
};

export const get_attendance_summary = async ({ date } = {}, ctx = {}) => {
    const day = normalizeDate(date || new Date());
    const filter = { date: day };
    if (ctx.companyId) filter.company = ctx.companyId;

    const records = await Attendance.find(filter);
    const present = records.filter((r) => ["present", "late", "half_day", "checked_in"].includes(r.status)).length;
    const late = records.filter((r) => r.status === "late").length;
    const empFilter = { status: { $ne: "inactive" } };
    if (ctx.companyId) empFilter.company = ctx.companyId;
    const totalEmployees = await Employee.countDocuments(empFilter);
    const rate = totalEmployees ? ((present / totalEmployees) * 100).toFixed(1) : 0;
    return { date: day, present, late, totalEmployees, attendanceRatePercent: Number(rate) };
};

export const get_late_comers = async ({ month, year, limit = 5 } = {}, ctx = {}) => {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const match = { date: { $gte: start, $lte: end }, status: "late" };
    if (ctx.companyId) match.company = ctx.companyId;

    const agg = await Attendance.aggregate([
        { $match: match },
        { $group: { _id: "$employee", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: Number(limit) },
    ]);
    const employees = await Employee.find({ _id: { $in: agg.map((a) => a._id) } }).select("name employeeCode");
    return agg.map((a) => ({
        employee: employees.find((e) => e._id.toString() === a._id.toString())?.name || "Unknown",
        lateCount: a.count,
    }));
};

export const get_leave_summary = async ({ department, month, year } = {}, ctx = {}) => {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const filter = { status: "approved", startDate: { $lte: end }, endDate: { $gte: start } };
    if (ctx.companyId) filter.company = ctx.companyId;

    const leaves = await LeaveRequest.find(filter)
        .populate("leaveType")
        .populate({ path: "employee", select: "name department", populate: "department" });

    const filtered = department ? leaves.filter((l) => l.employee?.department?._id?.toString() === department) : leaves;

    const byType = {};
    filtered.forEach((l) => {
        const typeName = l.leaveType?.name || "Other";
        byType[typeName] = (byType[typeName] || 0) + l.days;
    });

    return {
        month: m,
        year: y,
        totalApprovedLeaves: filtered.length,
        byType,
        employeesOnLeave: filtered.map((l) => l.employee?.name),
    };
};

export const get_my_leave_balance = async (_args, ctx = {}) => {
    if (!ctx.employeeId) return { error: "No employee profile linked to this user" };
    const filter = ctx.companyId ? { company: ctx.companyId } : {};
    const leaveTypes = await LeaveType.find(filter);
    return getBalanceForEmployee(ctx.employeeId, leaveTypes, new Date().getFullYear());
};

export const get_payroll_summary = async ({ month, year } = {}, ctx = {}) => {
    if (ctx.role === "employee") return { error: "Not authorized to view payroll summary" };
    const now = new Date();
    const filter = { month: month || now.getMonth() + 1, year: year || now.getFullYear() };
    if (ctx.companyId) filter.company = ctx.companyId;

    const run = await PayrollRun.findOne(filter);
    if (!run) return { message: "No payroll run found for that period" };
    return { month: run.month, year: run.year, status: run.status, totals: run.totals };
};

export const search_employees = async ({ query, department } = {}, ctx = {}) => {
    if (ctx.role === "employee") return { error: "Not authorized to search employees" };
    const filter = {};
    if (ctx.companyId) filter.company = ctx.companyId;
    if (query) filter.$text = { $search: query };
    if (department) filter.department = department;

    const employees = await Employee.find(filter)
        .select("name employeeCode email department")
        .populate("department")
        .limit(10);
    return employees.map((e) => ({ name: e.name, code: e.employeeCode, department: e.department?.name }));
};

export const toolRegistry = {
    get_headcount,
    get_attendance_summary,
    get_late_comers,
    get_leave_summary,
    get_my_leave_balance,
    get_payroll_summary,
    search_employees,
};

export const toolDefinitions = [
    { type: "function", function: { name: "get_headcount", description: "Get active employee headcount, optionally by department id", parameters: { type: "object", properties: { department: { type: "string" } } } } },
    { type: "function", function: { name: "get_attendance_summary", description: "Attendance summary (present, late, rate) for a date, default today", parameters: { type: "object", properties: { date: { type: "string" } } } } },
    { type: "function", function: { name: "get_late_comers", description: "Top late-coming employees for a month", parameters: { type: "object", properties: { month: { type: "number" }, year: { type: "number" }, limit: { type: "number" } } } } },
    { type: "function", function: { name: "get_leave_summary", description: "Approved leave summary for a month, optional department", parameters: { type: "object", properties: { department: { type: "string" }, month: { type: "number" }, year: { type: "number" } } } } },
    { type: "function", function: { name: "get_my_leave_balance", description: "Logged-in employee's own leave balance", parameters: { type: "object", properties: {} } } },
    { type: "function", function: { name: "get_payroll_summary", description: "Payroll run totals for a month (Admin/HR only)", parameters: { type: "object", properties: { month: { type: "number" }, year: { type: "number" } } } } },
    { type: "function", function: { name: "search_employees", description: "Search employees by name/code/email (Admin/HR only)", parameters: { type: "object", properties: { query: { type: "string" }, department: { type: "string" } } } } },
];
