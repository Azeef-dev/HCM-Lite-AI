import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";
import PayrollRun from "../models/PayrollRun.js";
import Payslip from "../models/Payslip.js";
import Company from "../models/Company.js";
import Holiday from "../models/Holiday.js";
import Announcement from "../models/Announcement.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeDate, isWorkingDay } from "../services/calendarService.js";

const today = () => normalizeDate(new Date());

export const getHrDashboard = asyncHandler(async (req, res) => {
    const { department } = req.query;
    const day = today();
    const companyId = req.user?.companyId;

    const empFilter = { status: { $ne: "inactive" } };
    if (companyId) empFilter.company = companyId;
    if (department) empFilter.department = department;

    const [employees, company, holidays, todayRecords, pendingLeaves, allLeaves] = await Promise.all([
        Employee.find(empFilter),
        companyId ? Company.findById(companyId) : Company.findOne(),
        Holiday.find(companyId ? { company: companyId } : {}),
        Attendance.find({ date: day, ...(companyId ? { company: companyId } : {}) }),
        LeaveRequest.countDocuments({ status: "pending", ...(companyId ? { company: companyId } : {}) }),
        LeaveRequest.find({ status: "approved", ...(companyId ? { company: companyId } : {}) }).populate("leaveType"),
    ]);

    const empIds = new Set(employees.map((e) => e._id.toString()));
    const todayForDept = todayRecords.filter((r) => empIds.has(r.employee.toString()));

    const presentToday = todayForDept.filter((r) =>
        ["present", "late", "half_day", "missing_checkout", "checked_in"].includes(r.status)
    ).length;
    const lateToday = todayForDept.filter((r) => r.status === "late").length;

    const onLeaveToday = allLeaves.filter(
        (l) => empIds.has(l.employee.toString()) && day >= normalizeDate(l.startDate) && day <= normalizeDate(l.endDate)
    ).length;

    // Attendance trend: last 14 working days
    const trend = [];
    const cursor = new Date(day);
    let collected = 0;
    while (collected < 14) {
        if (isWorkingDay(cursor, company?.weekends || [0, 6], holidays)) {
            const dayRecords = await Attendance.find({
                date: normalizeDate(cursor),
                ...(companyId ? { company: companyId } : {}),
            });
            const dayPresent = dayRecords.filter(
                (r) => empIds.has(r.employee.toString()) && r.status !== "missing_checkout"
            ).length;
            trend.unshift({ date: normalizeDate(cursor), present: dayPresent });
            collected++;
        }
        cursor.setDate(cursor.getDate() - 1);
    }

    const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);

    const lateCounts = await Attendance.aggregate([
        {
            $match: {
                date: { $gte: monthStart, $lte: day },
                status: "late",
                employee: { $in: employees.map((e) => e._id) },
                ...(companyId ? { company: companyId } : {}),
            },
        },
        { $group: { _id: "$employee", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);
    const lateEmployees = await Employee.find({ _id: { $in: lateCounts.map((l) => l._id) } }).select("name employeeCode");
    const topLateComers = lateCounts.map((l) => ({
        employee: lateEmployees.find((e) => e._id.toString() === l._id.toString()),
        count: l.count,
    }));

    const byDeptAgg = await Attendance.aggregate([
        {
            $match: {
                date: { $gte: monthStart, $lte: day },
                employee: { $in: employees.map((e) => e._id) },
            },
        },
        { $lookup: { from: "employees", localField: "employee", foreignField: "_id", as: "emp" } },
        { $unwind: "$emp" },
        {
            $group: {
                _id: "$emp.department",
                total: { $sum: 1 },
                absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
            },
        },
    ]);

    const yearStart = new Date(day.getFullYear(), 0, 1);
    const leaveTypes = await LeaveType.find(companyId ? { company: companyId } : {});
    const leaveByType = await Promise.all(
        leaveTypes.map(async (lt) => {
            const count = await LeaveRequest.countDocuments({
                leaveType: lt._id,
                status: "approved",
                startDate: { $gte: yearStart },
                ...(companyId ? { company: companyId } : {}),
            });
            return { leaveType: lt.name, count };
        })
    );

    res.json({
        kpis: { headcount: employees.length, presentToday, onLeaveToday, lateToday, pendingApprovals: pendingLeaves },
        attendanceTrend: trend,
        topLateComers,
        absenteeismByDepartment: byDeptAgg,
        leaveByType,
    });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
    const { department, from, to } = req.query;
    const companyId = req.user?.companyId;

    const empFilter = {};
    if (companyId) empFilter.company = companyId;
    if (department) empFilter.department = department;

    const employees = await Employee.find(empFilter).populate("department designation");
    const activeCount = employees.filter((e) => e.status !== "inactive").length;
    const exitsInPeriod = employees.filter((e) => {
        if (!e.dateOfLeaving) return false;
        if (from && new Date(e.dateOfLeaving) < new Date(from)) return false;
        if (to && new Date(e.dateOfLeaving) > new Date(to)) return false;
        return true;
    }).length;

    const avgHeadcount = Math.max(activeCount, 1);
    const attritionYtd = Number(((exitsInPeriod / avgHeadcount) * 100).toFixed(2));

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const finalizedRuns = await PayrollRun.find({
        status: "finalized",
        createdAt: { $gte: yearStart },
        ...(companyId ? { company: companyId } : {}),
    });
    const payrollCostYtd = finalizedRuns.reduce((sum, r) => sum + (r.totals?.netTotal || 0), 0);

    const avgSalary = employees.length ? employees.reduce((s, e) => s + e.salary.basic * 1.5, 0) / employees.length : 0;

    const byDept = {};
    for (const e of employees) {
        const name = e.department?.name || "Unassigned";
        byDept[name] = byDept[name] || { headcount: 0, payrollCost: 0 };
        byDept[name].headcount++;
        byDept[name].payrollCost += e.salary.basic * 1.5;
    }

    const genderSplit = employees.reduce((acc, e) => {
        acc[e.gender] = (acc[e.gender] || 0) + 1;
        return acc;
    }, {});

    const recentAudit = await AuditLog.find(companyId ? { company: companyId } : {})
        .sort({ createdAt: -1 })
        .limit(10);

    res.json({
        kpis: {
            headcount: activeCount,
            attritionYtd,
            payrollCostYtd: Number(payrollCostYtd.toFixed(2)),
            avgSalary: Number(avgSalary.toFixed(2)),
        },
        headcountByDepartment: Object.entries(byDept).map(([name, v]) => ({ department: name, ...v })),
        genderSplit,
        auditFeed: recentAudit,
    });
});

export const getEmployeeDashboard = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const companyId = req.user.companyId;
    const day = today();
    const weekStart = new Date(day);
    weekStart.setDate(day.getDate() - day.getDay());

    const [weekRecords, todayRecord, latestPayslip, leaveTypes, approvedLeavesThisYear, announcements] = await Promise.all([
        Attendance.find({ employee: employeeId, date: { $gte: weekStart, $lte: day } }),
        Attendance.findOne({ employee: employeeId, date: day }),
        Payslip.findOne({ employee: employeeId })
            .populate({ path: "payrollRun", match: { status: "finalized" } })
            .sort({ year: -1, month: -1 }),
        LeaveType.find(companyId ? { company: companyId } : {}),
        LeaveRequest.find({
            employee: employeeId,
            status: "approved",
            startDate: { $gte: new Date(day.getFullYear(), 0, 1) },
        }).populate("leaveType"),
        Announcement.find({
            audience: { $in: ["all", "employee"] },
            ...(companyId ? { company: companyId } : {}),
        })
            .sort({ createdAt: -1 })
            .limit(5),
    ]);

    const hoursThisWeek = weekRecords.reduce((s, r) => s + (r.workingHours || 0), 0);
    const lateCountThisMonth = await Attendance.countDocuments({
        employee: employeeId,
        status: "late",
        date: { $gte: new Date(day.getFullYear(), day.getMonth(), 1), $lte: day },
    });

    const leaveBalance = leaveTypes.map((lt) => {
        const used = approvedLeavesThisYear
            .filter((l) => l.leaveType?._id?.toString() === lt._id.toString())
            .reduce((s, l) => s + l.days, 0);
        return {
            leaveType: lt.name,
            quota: lt.annualQuota,
            used,
            remaining: lt.annualQuota > 0 ? lt.annualQuota - used : null,
        };
    });

    res.json({
        kpis: {
            hoursThisWeek: Number(hoursThisWeek.toFixed(2)),
            targetHours: 40,
            lateCountThisMonth,
            checkInStatusToday: todayRecord?.status || "not_checked_in",
        },
        leaveBalance,
        lastPayslip: latestPayslip?.payrollRun ? latestPayslip : null,
        announcements,
    });
});
