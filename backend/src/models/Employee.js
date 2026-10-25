import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        employeeCode: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        phone: { type: String },
        address: { type: String },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
        designation: { type: mongoose.Schema.Types.ObjectId, ref: "Designation" },
        dateOfJoining: { type: Date, required: true },
        dateOfLeaving: { type: Date, default: null },
        status: { type: String, enum: ["active", "probation", "inactive"], default: "probation" },
        gender: { type: String, enum: ["male", "female", "other"], default: "other" },
        salary: {
            basic: { type: Number, required: true, min: 1 },
        },
    },
    { timestamps: true }
);

employeeSchema.index({ company: 1, employeeCode: 1 });
employeeSchema.index({ company: 1, email: 1 });
employeeSchema.index({ name: "text", email: "text", employeeCode: "text" });

export default mongoose.model("Employee", employeeSchema);
