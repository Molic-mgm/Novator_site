import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { createUploader, uploadDir } from "../utils/upload.js";
import { normalizeMediaUrl } from "../utils/media.js";

const router = express.Router();
const upload = createUploader("file");

router.post("/", requireAuth, requireRole("admin", "manager"), upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "File is required" });
    }
    const url = normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`);
    res.json({ url });
});

export default router;
