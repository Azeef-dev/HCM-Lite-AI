import AuditLog from "../models/AuditLog.js";

export const logAudit = async ({ actor, action, entity, entityId, before, after, companyId }) => {
    try {
        const resolvedCompany = companyId || actor?.companyId || actor?.company || null;
        await AuditLog.create({
            company: resolvedCompany,
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
