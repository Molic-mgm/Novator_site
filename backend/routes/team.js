import express from "express";
import TeamMember from "../models/TeamMember.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { createUploader, uploadDir } from "../utils/upload.js";
import { normalizeMediaFields, normalizeMediaUrl, resolveMediaHost } from "../utils/media.js";

const router = express.Router();
const upload = createUploader("team");

router.get("/", async (req, res) => {
    const members = await TeamMember.find().sort({ createdAt: 1 }).lean();

    const normalized = members.map((m) =>
        normalizeMediaFields(
            {
                ...m,
                photoFit: m.photoFit || "cover",
                photoPosition: m.photoPosition || "center center",
            },
            ["photoUrl"],
            resolveMediaHost(req)
        )
    );

    res.json(normalized);
});

router.post("/", requireAuth, requireRole("admin", "manager"), upload.single("photo"), async (req, res) => {
    const created = await TeamMember.create({
        name: req.body.name,
        position: req.body.position,
        description: req.body.description,
        photoFit: req.body.photoFit || "cover",
        photoPosition: req.body.photoPosition || "center center",
        photoUrl: req.file
            ? normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`)
            : normalizeMediaUrl(req.body.photoUrl),
    });
    res.json(normalizeMediaFields(created.toObject(), ["photoUrl"], resolveMediaHost(req)));
});

router.put("/:id", requireAuth, requireRole("admin", "manager"), upload.single("photo"), async (req, res) => {
    const updated = await TeamMember.findById(req.params.id);
    if (!updated) return res.status(404).json({ message: "Team member not found" });

    updated.name = req.body.name ?? updated.name;
    updated.position = req.body.position ?? updated.position;
    updated.description = req.body.description ?? updated.description;
    updated.photoFit = req.body.photoFit ?? updated.photoFit;
    updated.photoPosition = req.body.photoPosition ?? updated.photoPosition;
    if (req.file) updated.photoUrl = normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`);
    if (req.body.photoUrl) updated.photoUrl = normalizeMediaUrl(req.body.photoUrl);

    await updated.save();
    if (!updated) return res.status(404).json({ message: "Team member not found" });
    res.json(normalizeMediaFields(updated.toObject(), ["photoUrl"], resolveMediaHost(req)));
});

router.delete("/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
    const deleted = await TeamMember.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Team member not found" });
    res.json({ success: true });
});

export default router;
