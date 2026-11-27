import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = fs.existsSync(path.join(__dirname, ".env"))
    ? path.join(__dirname, ".env")
    : path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

import { connectDB } from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/authRoutes.js";
import orgRoutes from "./src/routes/orgRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import payrollRoutes from "./src/routes/payrollRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import commsRoutes from "./src/routes/commsRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use(morgan("dev"));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("[db] Request blocked — database unavailable:", err.message);
        res.status(503).json({ message: "Service temporarily unavailable. Please try again shortly." });
    }
});

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/comms", commsRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;