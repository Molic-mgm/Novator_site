import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import shiftsRoutes from "./routes/shifts.js";
import bookingsRoutes from "./routes/bookings.js";
import contentRoutes from "./routes/content.js";
import teamRoutes from "./routes/team.js";
import Shift from "./models/Shift.js";
import Content from "./models/Content.js";
import galleryRoutes from "./routes/gallery.js";
import { uploadDir as uploadDirName } from "./utils/upload.js";
import configRoutes from "./routes/config.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = uploadDirName;
const absUpload = path.join(__dirname, uploadDir);
if (!fs.existsSync(absUpload)) fs.mkdirSync(absUpload, { recursive: true });

app.use(
    helmet({
        // Allow images and other assets to be embedded from this API on external domains
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(morgan("dev"));

const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        credentials: true
    })
);

app.use(express.json({ limit: "5mb" }));

const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 120),
});
app.use("/api", limiter);

// static uploads
app.use(`/${uploadDir}`, express.static(absUpload));

// routes
app.use("/api/auth", authRoutes);
// fallback for legacy clients calling without /api prefix
app.use("/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/shifts", shiftsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/config", configRoutes);

app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use((err, req, res, next) => {
    console.error("Unhandled error", err);
    // schedule restart to recover from unexpected runtime failures
    scheduleRestart("Express middleware error", err);
    res.status(500).json({ message: "Internal server error" });
});

app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));

let server = null;
let restartTimer = null;
const RESTART_DELAY_MS = Number(process.env.RESTART_DELAY_MS || 5000);

const scheduleRestart = (reason, err) => {
    if (restartTimer) return;
    if (err) console.error(reason, err);
    restartTimer = setTimeout(async () => {
        restartTimer = null;
        try {
            if (server) {
                await new Promise((resolve) => server.close(resolve));
                server = null;
            }
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        } catch (cleanupErr) {
            console.error("Error during restart cleanup", cleanupErr);
        }
        start().catch((e) => scheduleRestart("Retry after restart failure", e));
    }, RESTART_DELAY_MS);
};

async function start() {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

    await connectDB(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const mongoConnection = mongoose.connection;
    if (!mongoConnection.listenerCount("disconnected")) {
        mongoConnection.on("disconnected", () =>
            scheduleRestart("MongoDB disconnected; scheduling restart")
        );
        mongoConnection.on("error", (connectionError) =>
            scheduleRestart("MongoDB connection error", connectionError)
        );
    }

    // ensure at least one shift exists for booking form (idempotent)
    const hasShift = await Shift.exists();
    if (!hasShift) {
        await Shift.create({
            title: "Зимняя смена «Снежный код»",
            dates: "03.01.2026 – 09.01.2026",
            price: "",
            description: "",
            imageUrl: ""
        });
        console.log("✅ Default shift seeded");
    }

    // ensure home content exists (idempotent)
    const hasHome = await Content.exists({ slug: "home" });
    if (!hasHome) {
        const baseAbout = {
            title: "Наш опыт",
            text: "С 2012 года мы создаём пространство для роста и дружбы.",
        };

        await Content.create({
            slug: "home",
            hero: {
                title: "Детский IT лагерь «НОВАТОР»",
                subtitle: "Инновационный детский лагерь",
                description: "Присоединяйтесь к нам и станьте частью нового поколения новаторов!",
                cta: "Забронировать",
                showRocket: true,
            },
            about: baseAbout,
            experience: baseAbout,
            itDirections: [],
            bookingForm: {
                title: "Анкета на бронирование путёвки в лагерь «Новатор»",
                subtitle: "Выберите подходящую смену и заполните форму",
                consentText:
                    "Я согласен(на) на обработку персональных данных в соответствии с Федеральным законом №152-ФЗ",
            },
        });
        console.log("✅ Default home content seeded");
    }

    server = app
        .listen(PORT, () => console.log(`🚀 Backend on http://localhost:${PORT}`))
        .on("error", (serverError) => scheduleRestart("Server error", serverError));
}

process.on("unhandledRejection", (err) => scheduleRestart("Unhandled promise rejection", err));
process.on("uncaughtException", (err) => scheduleRestart("Uncaught exception", err));

start().catch((e) => scheduleRestart("Startup error", e));
