import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        audience: { type: String, enum: ["all", "hr", "employee"], default: "all" },
    },
    { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);