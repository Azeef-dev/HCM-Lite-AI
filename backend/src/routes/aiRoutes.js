import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { chat, dashboardSummary, smartLeave } from "../controllers/aiController.js";

const router = express.Router();
router.use(verifyToken);

router.post("/chat", chat); // all roles, scoped internally via ctx
router.post("/dashboard-summary", requireRole("admin", "hr"), dashboardSummary);
router.post("/smart-leave", requireRole("employee"), smartLeave);

export default router;