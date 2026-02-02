import express from "express";
import AuditLog from "../models/AuditLog.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
    const items = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
    res.json(items);
});

export default router;
