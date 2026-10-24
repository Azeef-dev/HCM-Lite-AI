import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
    {
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

export default mongoose.model("LeaveRequest", leaveRequestSchema);