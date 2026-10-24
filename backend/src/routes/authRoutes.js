import express from "express";
import { getSetupStatus, firstRunSetup, login, changePassword, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { loginValidator, setupValidator, changePasswordValidator } from "../validators/authValidators.js";

const router = express.Router();

router.get("/status", getSetupStatus);
router.post("/setup", setupValidator, firstRunSetup);
router.post("/login", loginValidator, login);
router.post("/change-password", verifyToken, changePasswordValidator, changePassword);
router.get("/me", verifyToken, getMe);

export default router;