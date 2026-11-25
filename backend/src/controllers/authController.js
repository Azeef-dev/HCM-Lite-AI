import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Department from "../models/Department.js";
import LeaveType from "../models/LeaveType.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../services/auditService.js";
import { sendMail } from "../utils/mailer.js";

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

const seedCompanyDefaults = async (companyId) => {
    try {
        const defaultDepts = ["Engineering", "Human Resources", "Finance", "Operations"];
        for (const name of defaultDepts) {
            await Department.create({ company: companyId, name, description: `${name} department` });
        }
        const defaultLeaves = [
            { name: "Annual", annualQuota: 14, isPaid: true },
            { name: "Sick", annualQuota: 8, isPaid: true },
            { name: "Casual", annualQuota: 10, isPaid: true },
            { name: "Unpaid", annualQuota: 0, isPaid: false },
        ];
        for (const l of defaultLeaves) {
            await LeaveType.create({ company: companyId, ...l });
        }
    } catch (e) {
        console.warn("Defaults seed warning:", e.message);
    }
};

export const getSetupStatus = asyncHandler(async (req, res) => {
    const count = await Company.countDocuments();
    res.json({ isSetupComplete: count > 0, totalCompanies: count });
});

export const listCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find().select("name address phone industry createdAt").sort({ name: 1 });
    res.json(companies);
});

export const firstRunSetup = asyncHandler(async (req, res) => {
    const { companyName, companyAddress, companyPhone, industry, adminName, adminEmail, adminPassword } = req.body;

    const name = companyName || process.env.COMPANY_NAME;
    const email = (adminEmail || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = adminPassword || process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Company name, admin email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
    }

    const company = await Company.create({
        name,
        address: companyAddress || "",
        phone: companyPhone || "",
        industry: industry || "Technology",
        isSetupComplete: true,
    });

    const admin = await User.create({
        name: adminName || "Administrator",
        email,
        password,
        role: "admin",
        company: company._id,
    });

    company.createdBy = admin._id;
    await company.save();

    await seedCompanyDefaults(company._id);

    await logAudit({
        actor: admin,
        action: "create",
        entity: "Company",
        entityId: company._id,
        after: company,
        companyId: company._id,
    });

    const token = signToken(admin);
    res.status(201).json({
        message: "Company registered successfully",
        token,
        user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            company: { id: company._id, name: company.name },
        },
    });
});

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, companyId } = req.body;
    if (!name || !email || !password || !companyId) {
        return res.status(400).json({ message: "Name, email, password, and company are required" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
        return res.status(404).json({ message: "Selected company does not exist" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: "employee",
        company: company._id,
        mustChangePassword: false,
    });

    const token = signToken(user);
    res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: { id: company._id, name: company.name },
        },
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("company");
    if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.company) {
        const firstComp = await Company.findOne();
        if (firstComp) {
            user.company = firstComp._id;
            await user.save();
            await user.populate("company");
        }
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
            company: user.company ? { id: user.company._id, name: user.company.name } : null,
            mustChangePassword: user.mustChangePassword,
        },
    });
});

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

export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password").populate("employee").populate("company");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee?._id || user.employee,
        employee: user.employee,
        company: user.company ? { id: user.company._id, name: user.company.name } : null,
        mustChangePassword: user.mustChangePassword,
    });
});

// ---- Forgot / Reset password ----

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the account exists, so we
    // never leak which emails are registered.
    const genericResponse = { message: "If an account exists for that email, a reset link has been sent." };

    if (!user || !user.isActive) {
        return res.json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const frontendOrigin = (process.env.FRONTEND_URL || "http://localhost:5173")
        .split(",")[0]
        .trim()
        .replace(/\/$/, "");
    const resetUrl = `${frontendOrigin}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const mailResult = await sendMail({
        to: user.email,
        subject: "Reset your HCM Lite password",
        html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    if (mailResult.skipped) {
        // Dev-only fallback: hand the link back directly so the feature keeps
        // working end-to-end before SMTP is configured. Never do this in
        // production — it would let anyone reset anyone's password.
        if (process.env.NODE_ENV !== "production") {
            return res.json({ ...genericResponse, devResetUrl: resetUrl });
        }
        console.warn(`[auth] Reset requested for ${user.email} but SMTP isn't configured — no email was sent.`);
    }

    res.json(genericResponse);
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    const invalid = { message: "This reset link is invalid or has expired. Please request a new one." };
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return res.status(400).json(invalid);
    }

    const tokenHash = crypto.createHash("sha256").update(token || "").digest("hex");
    if (tokenHash !== user.resetPasswordTokenHash) {
        return res.status(400).json(invalid);
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
});