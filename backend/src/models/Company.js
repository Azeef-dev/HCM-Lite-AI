import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        industry: { type: String, default: "" },
        officeStartTime: { type: String, default: "09:00" }, // HH:mm
        graceMinutes: { type: Number, default: 15 },
        halfDayHours: { type: Number, default: 5 },
        weekends: { type: [Number], default: [0, 6] }, // 0=Sun, 6=Sat
        officeLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },
        radiusMeters: { type: Number, default: 150 },
        isSetupComplete: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

export default mongoose.model("Company", companySchema);
