import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

export const verifyToken = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        let token = null;

        if (header && header.startsWith("Bearer ")) {
            token = header.split(" ")[1];
        } else if (req.query?.token) {
            // FIX: file downloads opened via <a target="_blank"> or window.open()
            // (payslip PDFs, employee CSV export) can't attach a custom
            // Authorization header — only a normal GET request. This fallback
            // is exactly what was causing "No token provided" on those links.
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password").populate("company");
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid or inactive user" });
        }

        let companyId = user.company ? (user.company._id || user.company).toString() : null;
        let companyName = user.company ? user.company.name : null;

        if (!companyId) {
            const firstComp = await Company.findOne();
            if (firstComp) {
                companyId = firstComp._id.toString();
                companyName = firstComp.name;
                user.company = firstComp._id;
                await user.save();
            }
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employee ? user.employee.toString() : null,
            companyId,
            companyName,
            mustChangePassword: user.mustChangePassword,
        };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
};