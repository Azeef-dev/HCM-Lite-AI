import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robustly locate .env whether started from root or backend directory
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

const app = express();

app.use(
    cors({
        // Origins aren't the actual security boundary here — every
        // protected route already requires a valid JWT — so we just
        // reflect whatever Origin the browser sends. The previous version
        // kept a FRONTEND_URL allow-list check but then unconditionally
        // returned callback(null, true) right after it anyway, so it was
        // already allowing every origin; this just removes that dead,
        // misleading code instead of pretending to restrict anything.
        origin: true,
        credentials: true,
    })
);

app.use(express.json());
app.use(morgan("dev"));

// Make sure MongoDB is connected before any route touches the database —
// and, critically, never let that crash the whole process (see the
// comment in src/config/db.js for why that matters here). This also
// guarantees CORS headers are always present on the response even when
// the database is unreachable, since cors() above already ran by then.
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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;