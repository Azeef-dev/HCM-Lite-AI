import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getAttritionRisk, getAbsenceAnomalies } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/attrition-risk", verifyToken, getAttritionRisk);
router.get("/absence-anomalies", verifyToken, getAbsenceAnomalies);

export default router;