import Employee from "../models/Employee.js";
import Company from "../models/Company.js";
import Holiday from "../models/Holiday.js";
import Payslip from "../models/Payslip.js";
import PayrollRun from "../models/PayrollRun.js";
import { getWorkingDaysInMonth } from "./calendarService.js";
import { getEmployeeMonthStats } from "./attendanceService.js";

// Illustrative annual tax slabs from the brief
export const calculateAnnualTax = (annualGross) => {
    if (annualGross <= 600000) return 0;
    const slabs = [
        { upto: 1200000, rate: 0.05, base: 0, from: 600000 },
        { upto: 2400000, rate: 0.15, base: 30000, from: 1200000 },
        { upto: 3600000, rate: 0.25, base: 210000, from: 2400000 },
        { upto: Infinity, rate: 0.35, base: 510000, from: 3600000 },
    ];
    const slab = slabs.find((s) => annualGross <= s.upto) || slabs[slabs.length - 1];
    return slab.base + (annualGross - slab.from) * slab.rate;
};

export const calculatePayslipForEmployee = async (employee, month, year, company, holidays) => {
    const basic = employee.salary.basic;
    const hra = basic * 0.4;
    const medical = basic * 0.1;
    const gross = basic * 1.5; // Gross = 1.5 x basic (HRA 40% + medical 10%)

    const fullMonthWorkingDays = getWorkingDaysInMonth(year, month, company.weekends, holidays).length;
    const stats = await getEmployeeMonthStats(employee, year, month, company, holidays);

    // Days outside the employment period (joiner/leaver proration) are treated like deduction days
    const nonEligibleDays = Math.max(fullMonthWorkingDays - stats.workingDaysInMonth, 0);
    const deductionDays = stats.absentDays + stats.unpaidLeaveDays + 0.5 * stats.halfDays + nonEligibleDays;

    const perDay = fullMonthWorkingDays > 0 ? gross / fullMonthWorkingDays : 0;
    const deductionAmount = Number((perDay * deductionDays).toFixed(2));

    const annualGross = gross * 12;
    const annualTax = calculateAnnualTax(annualGross);
    const taxMonthly = Number((annualTax / 12).toFixed(2));

    const netPay = Number((gross - deductionAmount - taxMonthly).toFixed(2));

    return {
        basic, hra, medical, gross,
        workingDaysInMonth: fullMonthWorkingDays,
        presentDays: stats.presentDays,
        absentDays: stats.absentDays,
        halfDays: stats.halfDays,
        paidLeaveDays: stats.paidLeaveDays,
        unpaidLeaveDays: stats.unpaidLeaveDays,
        deductionDays: Number(deductionDays.toFixed(2)),
        deductionAmount,
        taxMonthly,
        netPay,
    };
};

export const generatePayrollDraft = async (month, year, createdBy) => {
    const existing = await PayrollRun.findOne({ month, year });
    if (existing) {
        const err = new Error(`Payroll run for ${month}/${year} already exists`);
        err.statusCode = 409;
        throw err;
    }

    const [company, holidays, employees] = await Promise.all([
        Company.findOne(),
        Holiday.find(),
        Employee.find({ status: { $ne: "inactive" } }),
    ]);

    const run = await PayrollRun.create({ month, year, status: "draft", createdBy: createdBy.id });

    let grossTotal = 0, netTotal = 0, taxTotal = 0;

    for (const emp of employees) {
        const calc = await calculatePayslipForEmployee(emp, month, year, company || { weekends: [0, 6] }, holidays);
        await Payslip.create({ payrollRun: run._id, employee: emp._id, month, year, ...calc });
        grossTotal += calc.gross;
        netTotal += calc.netPay;
        taxTotal += calc.taxMonthly;
    }

    run.totals = {
        grossTotal: Number(grossTotal.toFixed(2)),
        netTotal: Number(netTotal.toFixed(2)),
        taxTotal: Number(taxTotal.toFixed(2)),
        employeeCount: employees.length,
    };
    await run.save();

    return run;
};