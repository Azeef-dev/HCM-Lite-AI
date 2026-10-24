import express from "express";
import multer from "multer";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as emp from "../controllers/employeeController.js";
import { createEmployeeValidator, updateEmployeeValidator } from "../validators/employeeValidators.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
router.use(verifyToken);

router.get("/", requireRole("admin", "hr"), emp.listEmployees);
router.post("/", requireRole("hr"), createEmployeeValidator, emp.createEmployee);
router.get("/export", requireRole("hr"), emp.exportEmployeesCsv);
router.post("/csv-import", requireRole("hr"), upload.single("file"), emp.importEmployeesCsv);
router.get("/:id", emp.getEmployee);
router.put("/:id", updateEmployeeValidator, emp.updateEmployee);

export default router;