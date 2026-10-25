import mongoose from "mongoose";

const payrollRunSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true },
        status: { type: String, enum: ["draft", "finalized"], default: "draft" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        finalizedAt: { type: Date },
        totals: {
            grossTotal: { type: Number, default: 0 },
            netTotal: { type: Number, default: 0 },
            taxTotal: { type: Number, default: 0 },
            employeeCount: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

payrollRunSchema.index({ company: 1, month: 1, year: 1 });

export default mongoose.model("PayrollRun", payrollRunSchema);
