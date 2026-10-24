import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // annual, sick, casual, unpaid
        annualQuota: { type: Number, default: 0 }, // 0 = unlimited (e.g. unpaid)
        isPaid: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);