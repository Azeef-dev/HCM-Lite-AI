import Employee from "../models/Employee.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";

const ALLOWED_HOSTS = ["res.cloudinary.com"];

export const updateEmployeePhoto = asyncHandler(async (req, res) => {
    const { photoUrl } = req.body;

    if (photoUrl) {
        let parsed;
        try {
            parsed = new URL(photoUrl);
        } catch {
            return res.status(400).json({ message: "Invalid photo URL" });
        }
        // Only accept our known image host — this value gets stored and
        // later rendered as an <img src>, so we don't want to accept an
        // arbitrary caller-supplied URL here.
        if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
            return res.status(400).json({ message: "Photo must be uploaded through the approved image host" });
        }
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const isSelf = req.user.employeeId && req.user.employeeId.toString() === employee._id.toString();
    if (!isSelf && !["admin", "hr"].includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const before = { photoUrl: employee.photoUrl || null };
    employee.photoUrl = photoUrl || null;
    await employee.save();

    await logAudit({
        actor: req.user,
        action: "update",
        entity: "Employee",
        entityId: employee._id,
        before,
        after: { photoUrl: employee.photoUrl },
        companyId: req.user.companyId,
    });

    res.json({ photoUrl: employee.photoUrl });
});