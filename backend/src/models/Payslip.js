import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
    {
        payrollRun: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollRun", required: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        basic: Number,
        hra: Number,
        medical: Number,
        gross: Number,
        workingDaysInMonth: Number,
        presentDays: Number,
        absentDays: Number,
        halfDays: Number,
        paidLeaveDays: Number,
        unpaidLeaveDays: Number,
        deductionDays: Number,
        deductionAmount: Number,
        taxMonthly: Number,
        netPay: Number,
    },
    { timestamps: true }
);

payslipSchema.index({ payrollRun: 1, employee: 1 }, { unique: true });

export default mongoose.model("Payslip", payslipSchema);