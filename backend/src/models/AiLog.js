import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: String,
        feature: { type: String, enum: ["chat", "dashboard_summary", "smart_leave"], default: "chat" },
        prompt: String,
        toolsUsed: [String],
        response: String,
        success: { type: Boolean, default: true },
        errorMessage: String,
    },
    { timestamps: true }
);

export default mongoose.model("AiLog", aiLogSchema);