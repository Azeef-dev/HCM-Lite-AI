import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        name: { type: String, required: true },
        date: { type: Date, required: true },
    },
    { timestamps: true }
);

holidaySchema.index({ company: 1, date: 1 });

export default mongoose.model("Holiday", holidaySchema);
