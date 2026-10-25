import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        name: { type: String, required: true },
        description: { type: String },
    },
    { timestamps: true }
);

departmentSchema.index({ company: 1, name: 1 });

export default mongoose.model("Department", departmentSchema);
