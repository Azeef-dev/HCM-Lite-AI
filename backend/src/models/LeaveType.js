import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        name: { type: String, required: true }, // annual, sick, casual, unpaid
        annualQuota: { type: Number, default: 0 }, // 0 = unlimited (e.g. unpaid)
        isPaid: { type: Boolean, default: true },
    },
    { timestamps: true }
);

leaveTypeSchema.index({ company: 1, name: 1 });

export default mongoose.model("LeaveType", leaveTypeSchema);
