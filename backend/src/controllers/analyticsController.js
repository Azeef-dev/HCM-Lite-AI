import { asyncHandler } from "../utils/asyncHandler.js";
import { computeAttritionRisk, computeAbsenceAnomalies } from "../services/analyticsService.js";

export const getAttritionRisk = asyncHandler(async (req, res) => {
    if (!["admin", "hr"].includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    const data = await computeAttritionRisk(req.user.companyId);
    res.json({ data });
});

export const getAbsenceAnomalies = asyncHandler(async (req, res) => {
    if (!["admin", "hr"].includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    const data = await computeAbsenceAnomalies(req.user.companyId);
    res.json({ data });
});