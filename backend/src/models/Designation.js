import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        title: { type: String, required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
    { timestamps: true }
);

designationSchema.index({ company: 1, title: 1 });

export default mongoose.model("Designation", designationSchema);
