import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
    { timestamps: true }
);

export default mongoose.model("Designation", designationSchema);