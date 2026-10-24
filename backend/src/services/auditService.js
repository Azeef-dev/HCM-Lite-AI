import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({ actor, action, entity, entityId, before, after }) => {
    try {
        await AuditLog.create({
            actor: actor?._id || actor?.id,
            actorName: actor?.name,
            action,
            entity,
            entityId,
            before,
            after,
        });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};