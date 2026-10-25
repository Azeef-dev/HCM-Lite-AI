import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        actorName: String,
        action: { type: String, required: true }, // create, update, approve, finalize, delete
        entity: { type: String, required: true }, // Employee, LeaveRequest, PayrollRun...
        entityId: String,
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

auditLogSchema.index({ company: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
