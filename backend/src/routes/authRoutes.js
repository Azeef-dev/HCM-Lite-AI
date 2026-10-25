import express from "express";
import {
    getSetupStatus,
    firstRunSetup,
    login,
    changePassword,
    getMe,
    listCompanies,
    registerUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { loginValidator, setupValidator, changePasswordValidator } from "../validators/authValidators.js";

const router = express.Router();

router.get("/status", getSetupStatus);
router.get("/companies", listCompanies);
router.post("/setup", setupValidator, firstRunSetup);
router.post("/register-company", setupValidator, firstRunSetup);
router.post("/register", registerUser);
router.post("/login", loginValidator, login);
router.post("/change-password", verifyToken, changePasswordValidator, changePassword);
router.get("/me", verifyToken, getMe);

export default router;
