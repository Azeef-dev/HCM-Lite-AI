import Employee from "../models/Employee.js";
import Company from "../models/Company.js";
import Holiday from "../models/Holiday.js";
import { getEmployeeMonthStats } from "./attendanceService.js";

const MONTHS_WINDOW = 3; // trailing 3 months of attendance/leave history

function lastNMonths(n) {
    const now = new Date();
    const months = [];
    for (let i = 0; i < n; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }
    return months;
}

async function aggregateStats(emp, months, company, holidays) {
    let workingDays = 0, absentDays = 0, lateDays = 0, halfDays = 0, unpaidLeaveDays = 0;
    for (const { month, year } of months) {
        try {
            const s = await getEmployeeMonthStats(emp, year, month, company, holidays);
            workingDays += s.workingDaysInMonth || 0;
            absentDays += s.absentDays || 0;
            lateDays += s.lateDays || 0;
            halfDays += s.halfDays || 0;
            unpaidLeaveDays += s.unpaidLeaveDays || 0;
        } catch {
            // Month before this employee joined, or a gap the stats
            // service can't compute for — skip it, never let one bad
            // month break the whole calculation.
        }
    }
    return { workingDays, absentDays, lateDays, halfDays, unpaidLeaveDays };
}

export const computeAttritionRisk = async (companyId) => {
    const [company, holidays, employees] = await Promise.all([
        companyId ? Company.findById(companyId) : Company.findOne(),
        Holiday.find(companyId ? { company: companyId } : {}),
        Employee.find({ ...(companyId ? { company: companyId } : {}), status: { $ne: "inactive" } }).populate("department", "name"),
    ]);

    const months = lastNMonths(MONTHS_WINDOW);
    const now = new Date();
    const results = [];

    for (const emp of employees) {
        const { workingDays, absentDays, lateDays, halfDays, unpaidLeaveDays } =
            await aggregateStats(emp, months, company || { weekends: [0, 6] }, holidays);

        const safeWorkingDays = Math.max(workingDays, 1);
        const absenceRate = absentDays / safeWorkingDays;
        const lateRate = lateDays / safeWorkingDays;
        const halfDayRate = halfDays / safeWorkingDays;
        const unpaidRate = unpaidLeaveDays / safeWorkingDays;

        const joinDate = emp.joinDate || emp.dateOfJoining || emp.joiningDate || emp.createdAt;
        const tenureDays = joinDate ? Math.floor((now - new Date(joinDate)) / 86400000) : null;
        const isNewHire = tenureDays !== null && tenureDays <= 90;

        let score =
            Math.min(50, absenceRate * 150) +
            Math.min(20, unpaidRate * 100) +
            Math.min(20, lateRate * 100) +
            Math.min(10, halfDayRate * 50) +
            (isNewHire ? 10 : 0);
        score = Math.round(Math.min(100, score));

        let band = "Low";
        if (score >= 60) band = "High";
        else if (score >= 30) band = "Medium";

        results.push({
            employeeId: emp._id,
            name: emp.name,
            employeeCode: emp.employeeCode,
            department: emp.department?.name || null,
            score,
            band,
            signals: { absentDays, lateDays, halfDays, unpaidLeaveDays, isNewHire },
        });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
};

/**
 * Flags employees whose CURRENT month's absence rate is a significant
 * jump versus their OWN trailing-3-month baseline — a spike relative to
 * themselves, not just a raw "too many absences" threshold. This catches
 * a sudden change worth asking about, which a flat threshold would miss
 * for someone whose baseline is already a bit high.
 */
export const computeAbsenceAnomalies = async (companyId) => {
    const [company, holidays, employees] = await Promise.all([
        companyId ? Company.findById(companyId) : Company.findOne(),
        Holiday.find(companyId ? { company: companyId } : {}),
        Employee.find({ ...(companyId ? { company: companyId } : {}), status: { $ne: "inactive" } }).populate("department", "name"),
    ]);

    const now = new Date();
    const currentMonth = { month: now.getMonth() + 1, year: now.getFullYear() };
    const baselineMonths = [1, 2, 3].map((i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const results = [];

    for (const emp of employees) {
        let currentAbsent = 0, currentWorking = 0;
        try {
            const s = await getEmployeeMonthStats(emp, currentMonth.year, currentMonth.month, company || { weekends: [0, 6] }, holidays);
            currentAbsent = s.absentDays || 0;
            currentWorking = s.workingDaysInMonth || 0;
        } catch {
            continue;
        }
        if (currentWorking === 0) continue;

        const { workingDays: baselineWorking, absentDays: baselineAbsent } =
            await aggregateStats(emp, baselineMonths, company || { weekends: [0, 6] }, holidays);
        const monthsWithData = baselineMonths.length;

        const currentRate = currentAbsent / currentWorking;
        const baselineRate = baselineWorking > 0 ? baselineAbsent / baselineWorking : 0;

        const isAnomaly = currentAbsent >= 3 && (currentRate > baselineRate * 2 || (baselineRate === 0 && currentRate > 0.2));
        if (!isAnomaly) continue;

        results.push({
            employeeId: emp._id,
            name: emp.name,
            employeeCode: emp.employeeCode,
            department: emp.department?.name || null,
            currentAbsentDays: currentAbsent,
            baselineAvgAbsentDays: Number((baselineAbsent / monthsWithData).toFixed(1)),
        });
    }

    return results;
};