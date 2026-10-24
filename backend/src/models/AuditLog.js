import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
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

export default mongoose.model("AuditLog", auditLogSchema);