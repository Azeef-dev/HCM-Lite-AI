import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as dash from "../controllers/dashboardController.js";

const router = express.Router();
router.use(verifyToken);

router.get("/admin", requireRole("admin"), dash.getAdminDashboard);
router.get("/hr", requireRole("admin", "hr"), dash.getHrDashboard);
router.get("/employee", requireRole("employee"), dash.getEmployeeDashboard);

export default router;