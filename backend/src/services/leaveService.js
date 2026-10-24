import LeaveRequest from "../models/LeaveRequest.js";
import { countWorkingDays } from "./calendarService.js";

// Throws a validated error object { status, message } on failure
export const validateAndCreateLeave = async ({ employeeId, leaveType, startDate, endDate, reason, company, holidays, source = "manual" }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        const err = new Error("Start date must be before end date");
        err.statusCode = 422;
        throw err;
    }

    const days = countWorkingDays(start, end, company.weekends, holidays);
    if (days <= 0) {
        const err = new Error("Selected range has no working days");
        err.statusCode = 422;
        throw err;
    }

    // Overlap check
    const overlap = await LeaveRequest.findOne({
        employee: employeeId,
        status: { $in: ["pending", "approved"] },
        startDate: { $lte: end },
        endDate: { $gte: start },
    });
    if (overlap) {
        const err = new Error("You already have a leave request overlapping these dates");
        err.statusCode = 422;
        throw err;
    }

    // Balance check (skip if quota is 0 = unlimited, e.g. unpaid)
    if (leaveType.annualQuota > 0) {
        const yearStart = new Date(start.getFullYear(), 0, 1);
        const yearEnd = new Date(start.getFullYear(), 11, 31, 23, 59, 59);

        const approved = await LeaveRequest.find({
            employee: employeeId,
            leaveType: leaveType._id,
            status: "approved",
            startDate: { $gte: yearStart, $lte: yearEnd },
        });
        const usedDays = approved.reduce((sum, l) => sum + l.days, 0);

        if (usedDays + days > leaveType.annualQuota) {
            const err = new Error(
                `Insufficient leave balance: used ${usedDays}/${leaveType.annualQuota}, requested ${days} more`
            );
            err.statusCode = 422;
            throw err;
        }
    }

    return LeaveRequest.create({
        employee: employeeId,
        leaveType: leaveType._id,
        startDate: start,
        endDate: end,
        days,
        reason,
        source,
    });
};

export const getBalanceForEmployee = async (employeeId, leaveTypes, year) => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const approved = await LeaveRequest.find({
        employee: employeeId,
        status: "approved",
        startDate: { $gte: yearStart, $lte: yearEnd },
    });

    return leaveTypes.map((lt) => {
        const used = approved.filter((l) => l.leaveType.toString() === lt._id.toString()).reduce((s, l) => s + l.days, 0);
        return {
            leaveType: lt.name,
            quota: lt.annualQuota,
            used,
            remaining: lt.annualQuota > 0 ? lt.annualQuota - used : null, // null = unlimited
        };
    });
};