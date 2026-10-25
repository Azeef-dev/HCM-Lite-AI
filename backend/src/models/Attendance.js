import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        date: { type: Date, required: true }, // normalized to midnight
        checkInTime: { type: Date, default: null },
        checkOutTime: { type: Date, default: null },
        workingHours: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["checked_in", "present", "late", "half_day", "missing_checkout"],
            default: "checked_in",
        },
        source: { type: String, enum: ["web"], default: "web" },
        correction: {
            requested: { type: Boolean, default: false },
            requestedCheckIn: { type: Date, default: null },
            requestedCheckOut: { type: Date, default: null },
            reason: { type: String },
            status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reviewComment: { type: String },
            reviewedAt: { type: Date },
        },
    },
    { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ company: 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);
