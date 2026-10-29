import { isPointWithinRadius, getDistance } from "geolib";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { normalizeDate } from "./calendarService.js";

export const getEmployeeMonthStats = async (employee, year, month, company, holidays) => {
    const weekends = company.weekends;
    const { getWorkingDaysInMonth } = await import("./calendarService.js");
    const workingDays = getWorkingDaysInMonth(year, month, weekends, holidays);

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const joinDate = normalizeDate(employee.dateOfJoining);
    const leaveDate = employee.dateOfLeaving ? normalizeDate(employee.dateOfLeaving) : null;

    const effectiveDays = workingDays.filter((d) => {
        if (d < joinDate) return false;
        if (leaveDate && d > leaveDate) return false;
        return true;
    });

    const records = await Attendance.find({
        employee: employee._id,
        date: { $gte: monthStart, $lte: monthEnd },
    });
    const recordMap = new Map(records.map((r) => [normalizeDate(r.date).getTime(), r]));

    const approvedLeaves = await LeaveRequest.find({
        employee: employee._id,
        status: "approved",
        startDate: { $lte: monthEnd },
        endDate: { $gte: monthStart },
    }).populate("leaveType");

    const isOnApprovedLeave = (date) =>
        approvedLeaves.find((l) => normalizeDate(date) >= normalizeDate(l.startDate) && normalizeDate(date) <= normalizeDate(l.endDate));

    let presentDays = 0, lateDays = 0, halfDays = 0, absentDays = 0, missingCheckoutDays = 0, unpaidLeaveDays = 0, paidLeaveDays = 0;

    for (const day of effectiveDays) {
        const rec = recordMap.get(day.getTime());
        if (rec) {
            if (rec.status === "present") presentDays++;
            else if (rec.status === "late") lateDays++;
            else if (rec.status === "half_day") halfDays++;
            else if (rec.status === "missing_checkout") missingCheckoutDays++;
            continue;
        }
        const leave = isOnApprovedLeave(day);
        if (leave) {
            if (leave.leaveType?.isPaid === false) unpaidLeaveDays++;
            else paidLeaveDays++;
            continue;
        }
        absentDays++;
    }

    return {
        workingDaysInMonth: effectiveDays.length,
        presentDays,
        lateDays,
        halfDays,
        absentDays,
        missingCheckoutDays,
        unpaidLeaveDays,
        paidLeaveDays,
    };
};

// FIX: "geolib" was already sitting in backend/package.json as a dependency —
// written for exactly this bonus feature — but never imported or used
// anywhere. This is the server-side geofence check the brief describes:
// "The server calculates the distance to the office (Haversine formula) and
// decides; the phone only sends data."
export const checkOfficeGeofence = (company, lat, lng) => {
    if (company?.officeLocation?.lat == null || company?.officeLocation?.lng == null) {
        // Admin hasn't set an office location yet in Organization Setup —
        // don't block check-ins just because the geofence isn't configured.
        return { configured: false, withinRadius: true, distance: null, radius: null };
    }
    const officePoint = { latitude: company.officeLocation.lat, longitude: company.officeLocation.lng };
    const point = { latitude: lat, longitude: lng };
    const radius = company.radiusMeters || 150;
    return {
        configured: true,
        withinRadius: isPointWithinRadius(point, officePoint, radius),
        distance: getDistance(point, officePoint),
        radius,
    };
};