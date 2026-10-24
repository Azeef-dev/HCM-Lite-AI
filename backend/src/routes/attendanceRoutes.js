import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as att from "../controllers/attendanceController.js";
import { correctionRequestValidator, reviewCorrectionValidator } from "../validators/attendanceValidators.js";

const router = express.Router();
router.use(verifyToken);

router.post("/check-in", requireRole("employee"), att.checkIn);
router.post("/check-out", requireRole("employee"), att.checkOut);
router.get("/me", requireRole("employee"), att.getMyAttendance);
router.post("/correction", requireRole("employee"), correctionRequestValidator, att.requestCorrection);

router.get("/corrections", requireRole("admin", "hr"), att.listCorrections);
router.put("/corrections/:id/review", requireRole("hr"), reviewCorrectionValidator, att.reviewCorrection);

router.get("/board", requireRole("admin", "hr"), att.getAttendanceBoard);

export default router;