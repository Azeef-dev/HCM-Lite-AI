import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as leave from "../controllers/leaveController.js";

const router = express.Router();
router.use(verifyToken);

router.post("/", requireRole("employee"), leave.applyLeave);
router.put("/:id/cancel", requireRole("employee"), leave.cancelLeave);
router.get("/me", requireRole("employee"), leave.getMyLeaves);
router.get("/balance", requireRole("employee"), leave.getMyBalance);

router.get("/pending", requireRole("admin", "hr"), leave.listPendingLeaves);
router.get("/", requireRole("admin", "hr"), leave.listAllLeaves);
router.put("/:id/approve", requireRole("hr"), leave.approveLeave);
router.put("/:id/reject", requireRole("hr"), leave.rejectLeave);

export default router;