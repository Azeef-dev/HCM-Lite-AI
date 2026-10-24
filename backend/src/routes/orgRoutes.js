import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as org from "../controllers/orgController.js";

const router = express.Router();
router.use(verifyToken);

// Company settings
router.get("/settings", org.getCompanySettings);
router.put("/settings", requireRole("admin"), org.updateCompanySettings);

// Departments
router.get("/departments", org.listDepartments);
router.post("/departments", requireRole("admin"), org.createDepartment);
router.put("/departments/:id", requireRole("admin"), org.updateDepartment);
router.delete("/departments/:id", requireRole("admin"), org.deleteDepartment);

// Designations
router.get("/designations", org.listDesignations);
router.post("/designations", requireRole("admin"), org.createDesignation);
router.put("/designations/:id", requireRole("admin"), org.updateDesignation);
router.delete("/designations/:id", requireRole("admin"), org.deleteDesignation);

// Leave types
router.get("/leave-types", org.listLeaveTypes);
router.post("/leave-types", requireRole("admin"), org.createLeaveType);
router.put("/leave-types/:id", requireRole("admin"), org.updateLeaveType);
router.delete("/leave-types/:id", requireRole("admin"), org.deleteLeaveType);

// Holidays
router.get("/holidays", org.listHolidays);
router.post("/holidays", requireRole("admin"), org.createHoliday);
router.delete("/holidays/:id", requireRole("admin"), org.deleteHoliday);

// Users (HR/Employee accounts)
router.get("/users", requireRole("admin"), org.listUsers);
router.post("/users/hr", requireRole("admin"), org.createHrUser);
router.put("/users/:id/active", requireRole("admin"), org.setUserActive);
router.post("/users/:id/reset-password", requireRole("admin"), org.resetUserPassword);

export default router;