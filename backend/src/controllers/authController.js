import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// GET /api/auth/status  -> tells frontend if first-run setup is needed
export const getSetupStatus = asyncHandler(async (req, res) => {
    const company = await Company.findOne();
    res.json({ isSetupComplete: !!company?.isSetupComplete });
});

// POST /api/auth/setup  -> first-run: creates company + admin
export const firstRunSetup = asyncHandler(async (req, res) => {
    const existing = await Company.findOne();
    if (existing?.isSetupComplete) {
        return res.status(400).json({ message: "Setup already completed" });
    }

    const { companyName, adminName, adminEmail, adminPassword } = req.body;

    const name = companyName || process.env.COMPANY_NAME;
    const email = (adminEmail || process.env.ADMIN_EMAIL || "").toLowerCase();
    const password = adminPassword || process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "companyName, adminEmail and adminPassword are required" });
    }

    const company = existing || (await Company.create({ name }));
    company.name = name;
    company.isSetupComplete = true;
    await company.save();

    let admin = await User.findOne({ email });
    if (!admin) {
        admin = await User.create({
            name: adminName || "Admin",
            email,
            password,
            role: "admin",
        });
    }

    await logAudit({ actor: admin, action: "create", entity: "Company", entityId: company._id, after: company });

    const token = signToken(admin);
    res.status(201).json({
        message: "Setup complete",
        token,
        user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employee,
            mustChangePassword: user.mustChangePassword,
        },
    });
});

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: "Current password incorrect" });

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password changed successfully" });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password").populate("employee");
    res.json(user);
});