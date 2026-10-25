import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as comms from "../controllers/commsController.js";
import { announcementValidator } from "../validators/commsValidators.js";

const router = express.Router();
router.use(verifyToken);

router.post("/announcements", requireRole("admin", "hr"), announcementValidator, comms.createAnnouncement);
router.get("/announcements", comms.listAnnouncements);

router.get("/notifications/me", comms.getMyNotifications);
router.put("/notifications/mark-all-read", comms.markAllNotificationsRead);
router.put("/notifications/:id/read", comms.markNotificationRead);

router.get("/audit", requireRole("admin"), comms.getAuditLog);

export default router;