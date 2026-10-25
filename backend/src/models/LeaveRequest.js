import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        leaveType: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveType", required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        days: { type: Number, required: true }, // working days count
        reason: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        source: { type: String, enum: ["manual", "ai"], default: "manual" },
    },
    { timestamps: true }
);

leaveRequestSchema.index({ company: 1, status: 1 });
leaveRequestSchema.index({ employee: 1, startDate: 1 });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
