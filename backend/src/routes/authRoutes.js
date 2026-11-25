import express from "express";
import {
    getSetupStatus,
    firstRunSetup,
    login,
    changePassword,
    getMe,
    listCompanies,
    registerUser,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import {
    loginValidator,
    setupValidator,
    changePasswordValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} from "../validators/authValidators.js";

const router = express.Router();

router.get("/status", getSetupStatus);
router.get("/companies", listCompanies);
router.post("/setup", setupValidator, firstRunSetup);
router.post("/register-company", setupValidator, firstRunSetup);
router.post("/register", registerUser);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/reset-password", resetPasswordValidator, resetPassword);
router.post("/change-password", verifyToken, changePasswordValidator, changePassword);
router.get("/me", verifyToken, getMe);

export default router;