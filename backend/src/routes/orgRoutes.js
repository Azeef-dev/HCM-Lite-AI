import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as org from "../controllers/orgController.js";
import {
    departmentValidator, designationValidator, leaveTypeValidator,
    holidayValidator, companySettingsValidator, createHrValidator,
} from "../validators/orgValidators.js";

const router = express.Router();
router.use(verifyToken);

router.get("/settings", org.getCompanySettings);
router.put("/settings", requireRole("admin"), companySettingsValidator, org.updateCompanySettings);

router.get("/departments", org.listDepartments);
router.post("/departments", requireRole("admin"), departmentValidator, org.createDepartment);
router.put("/departments/:id", requireRole("admin"), departmentValidator, org.updateDepartment);
router.delete("/departments/:id", requireRole("admin"), org.deleteDepartment);

router.get("/designations", org.listDesignations);
router.post("/designations", requireRole("admin"), designationValidator, org.createDesignation);
router.put("/designations/:id", requireRole("admin"), designationValidator, org.updateDesignation);
router.delete("/designations/:id", requireRole("admin"), org.deleteDesignation);

router.get("/leave-types", org.listLeaveTypes);
router.post("/leave-types", requireRole("admin"), leaveTypeValidator, org.createLeaveType);
router.put("/leave-types/:id", requireRole("admin"), leaveTypeValidator, org.updateLeaveType);
router.delete("/leave-types/:id", requireRole("admin"), org.deleteLeaveType);

router.get("/holidays", org.listHolidays);
router.post("/holidays", requireRole("admin"), holidayValidator, org.createHoliday);
router.delete("/holidays/:id", requireRole("admin"), org.deleteHoliday);

router.get("/users", requireRole("admin"), org.listUsers);
router.post("/users/hr", requireRole("admin"), createHrValidator, org.createHrUser);
router.put("/users/:id/active", requireRole("admin"), org.setUserActive);
router.post("/users/:id/reset-password", requireRole("admin"), org.resetUserPassword);

export default router;