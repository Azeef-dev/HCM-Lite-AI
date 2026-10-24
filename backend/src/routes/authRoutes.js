import express from "express";
import {
    getSetupStatus,
    firstRunSetup,
    login,
    changePassword,
    getMe,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/status", getSetupStatus);
router.post("/setup", firstRunSetup);
router.post("/login", login);
router.post("/change-password", verifyToken, changePassword);
router.get("/me", verifyToken, getMe);

export default router;