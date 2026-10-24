import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Company from "../models/Company.js";
import Holiday from "../models/Holiday.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeDate, isLateCheckIn, isWorkingDay } from "../services/calendarService.js";
import { logAudit } from "../services/auditService.js";

const getCompany = async () => (await Company.findOne()) || {};

// POST /api/attendance/check-in
export const checkIn = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ message: "No employee profile linked to this user" });

    const now = new Date();
    const today = normalizeDate(now);

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing?.checkInTime) {
        return res.status(409).json({ message: "Already checked in today" });
    }

    const company = await getCompany();
    const late = isLateCheckIn(now, company.officeStartTime || "09:00", company.graceMinutes ?? 15);

    const record = existing
        ? Object.assign(existing, { checkInTime: now, status: late ? "late" : "checked_in" })
        : new Attendance({
            employee: employeeId,
            date: today,
            checkInTime: now,
            status: late ? "late" : "checked_in",
        });

    await record.save();
    res.status(201).json(record);
});

// POST /api/attendance/check-out
export const checkOut = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const today = normalizeDate(new Date());

    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record || !record.checkInTime) {
        return res.status(400).json({ message: "You have not checked in today" });
    }
    if (record.checkOutTime) {
        return res.status(409).json({ message: "Already checked out today" });
    }

    const now = new Date();
    const company = await getCompany();
    const hours = (now - record.checkInTime) / (1000 * 60 * 60);
    const wasLate = isLateCheckIn(record.checkInTime, company.officeStartTime || "09:00", company.graceMinutes ?? 15);

    let status = "present";
    if (hours < (company.halfDayHours ?? 5)) status = "half_day";
    else if (wasLate) status = "late";

    record.checkOutTime = now;
    record.workingHours = Number(hours.toFixed(2));
    record.status = status;
    await record.save();

    res.json(record);
});

// GET /api/attendance/me?month=10&year=2026
export const getMyAttendance = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { month, year } = req.query;

    const filter = { employee: employeeId };
    if (month && year) {
        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
        filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
});

// POST /api/attendance/correction  (Employee requests)
export const requestCorrection = asyncHandler(async (req, res) => {
    const employeeId = req.user.employeeId;
    const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;

    if (!date || !reason) return res.status(400).json({ message: "date and reason are required" });

    const day = normalizeDate(date);
    let record = await Attendance.findOne({ employee: employeeId, date: day });
    if (!record) {
        record = new Attendance({ employee: employeeId, date: day, status: "checked_in" });
    }

    if (record.correction?.status === "pending") {
        return res.status(409).json({ message: "A correction request is already pending for this date" });
    }

    record.correction = {
        requested: true,
        requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : null,
        requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : null,
        reason,
        status: "pending",
    };
    await record.save();
    res.status(201).json(record);
});

// GET /api/attendance/corrections  (HR/Admin - pending list)
export const listCorrections = asyncHandler(async (req, res) => {
    const records = await Attendance.find({ "correction.status": "pending" })
        .populate({ path: "employee", select: "name employeeCode department", populate: "department" })
        .sort({ "correction.requestedAt": -1 });
    res.json(records);
});

// PUT /api/attendance/corrections/:id/review  (HR approves/rejects)
export const reviewCorrection = asyncHandler(async (req, res) => {
    const { decision, comment } = req.body; // decision: "approved" | "rejected"
    const record = await Attendance.findById(req.params.id);
    if (!record || record.correction?.status !== "pending") {
        return res.status(404).json({ message: "No pending correction found" });
    }

    const before = record.toObject();

    if (decision === "approved") {
        const company = await getCompany();
        if (record.correction.requestedCheckIn) record.checkInTime = record.correction.requestedCheckIn;
        if (record.correction.requestedCheckOut) record.checkOutTime = record.correction.requestedCheckOut;

        if (record.checkInTime && record.checkOutTime) {
            const hours = (record.checkOutTime - record.checkInTime) / (1000 * 60 * 60);
            const late = isLateCheckIn(record.checkInTime, company.officeStartTime || "09:00", company.graceMinutes ?? 15);
            record.workingHours = Number(hours.toFixed(2));
            record.status = hours < (company.halfDayHours ?? 5) ? "half_day" : late ? "late" : "present";
        } else if (record.checkInTime) {
            record.status = "missing_checkout";
        }
    }

    record.correction.status = decision;
    record.correction.reviewedBy = req.user.id;
    record.correction.reviewComment = comment;
    record.correction.reviewedAt = new Date();

    await record.save();
    await logAudit({ actor: req.user, action: "approve", entity: "AttendanceCorrection", entityId: record._id, before, after: record });

    res.json(record);
});

// GET /api/attendance/board?date=2026-10-24&department=xxx  (HR/Admin daily board)
export const getAttendanceBoard = asyncHandler(async (req, res) => {
    const { date, department } = req.query;
    const day = normalizeDate(date || new Date());

    const empFilter = { status: { $ne: "inactive" } };
    if (department) empFilter.department = department;

    const [employees, records, approvedLeaves, company, holidays] = await Promise.all([
        Employee.find(empFilter).populate("department designation"),
        Attendance.find({ date: day }),
        LeaveRequest.find({ status: "approved", startDate: { $lte: day }, endDate: { $gte: day } }),
        getCompany(),
        Holiday.find(),
    ]);

    const recordMap = new Map(records.map((r) => [r.employee.toString(), r]));
    const leaveMap = new Map(approvedLeaves.map((l) => [l.employee.toString(), l]));
    const working = isWorkingDay(day, company.weekends || [0, 6], holidays);

    const board = employees.map((emp) => {
        const rec = recordMap.get(emp._id.toString());
        const onLeave = leaveMap.get(emp._id.toString());
        let status;
        if (rec) status = rec.status;
        else if (onLeave) status = "on_leave";
        else if (!working) status = "off";
        else status = "absent";

        return {
            employee: { id: emp._id, name: emp.name, code: emp.employeeCode, department: emp.department?.name },
            status,
            checkInTime: rec?.checkInTime || null,
            checkOutTime: rec?.checkOutTime || null,
        };
    });

    const summary = board.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {});

    res.json({ date: day, summary, board });
});