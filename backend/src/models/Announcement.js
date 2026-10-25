import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        title: { type: String, required: true },
        message: { type: String, required: true },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        audience: { type: String, enum: ["all", "hr", "employee"], default: "all" },
    },
    { timestamps: true }
);

announcementSchema.index({ company: 1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
