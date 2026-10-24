import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as payroll from "../controllers/payrollController.js";
import { createPayrollRunValidator } from "../validators/payrollValidators.js";

const router = express.Router();
router.use(verifyToken);

router.post("/runs", requireRole("hr"), createPayrollRunValidator, payroll.createPayrollRun);
router.get("/runs", requireRole("admin", "hr"), payroll.listPayrollRuns);
router.get("/runs/:id", requireRole("admin", "hr"), payroll.getPayrollRun);
router.put("/runs/:id/finalize", requireRole("admin"), payroll.finalizePayrollRun);

router.get("/payslips/me", requireRole("employee"), payroll.getMyPayslips);
router.get("/payslips/:id/pdf", payroll.downloadPayslipPdf); // scope-checked inside

export default router;