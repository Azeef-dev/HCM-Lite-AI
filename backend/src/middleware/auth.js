import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid or inactive user" });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employee ? user.employee.toString() : null,
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