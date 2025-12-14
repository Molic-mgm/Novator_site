import express from "express";
import { body } from "express-validator";
import Shift from "../models/Shift.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import { createUploader, uploadDir } from "../utils/upload.js";
import { normalizeMediaFields, normalizeMediaUrl, resolveMediaHost } from "../utils/media.js";

const router = express.Router();

const upload = createUploader("shift");

router.get("/", async (req, res) => {
    const items = await Shift.find().sort({ createdAt: -1 }).lean();
    const mediaHost = resolveMediaHost(req);

    const normalized = items.map((s) =>
        normalizeMediaFields(
            {
                ...s,
                imageFit: s.imageFit || "cover",
                imagePosition: s.imagePosition || "center center",
            },
            ["imageUrl"],
            mediaHost
        )
    );

    res.json(normalized);
});

router.post(
    "/",
    requireAuth,
    requireRole("admin", "manager"),
    [
        body("title").isString().notEmpty(),
        body("dates").optional().isString(),
        body("price").optional().isString(),
        body("description").optional().isString(),
        body("imageFit").optional().isString(),
        body("imagePosition").optional().isString(),
    ],
    validate,
    async (req, res) => {
        const s = await Shift.create({
            title: req.body.title,
            dates: req.body.dates,
            price: req.body.price,
            description: req.body.description,
            imageUrl: normalizeMediaUrl(req.body.imageUrl),
            imageFit: req.body.imageFit || "cover",
            imagePosition: req.body.imagePosition || "center center",
            isActive: req.body.isActive !== false,
        });
        res.json(normalizeMediaFields(s.toObject(), ["imageUrl"], resolveMediaHost(req)));
    }
);

router.patch(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const payload = { ...req.body };
        if (req.body.imageFit) payload.imageFit = req.body.imageFit;
        if (req.body.imagePosition) payload.imagePosition = req.body.imagePosition;
        if (payload.imageUrl) payload.imageUrl = normalizeMediaUrl(payload.imageUrl);

        const s = await Shift.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!s) return res.status(404).json({ message: "Not found" });
        res.json(normalizeMediaFields(s.toObject(), ["imageUrl"], resolveMediaHost(req)));
    }
);

router.delete(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const s = await Shift.findByIdAndDelete(req.params.id);
        if (!s) return res.status(404).json({ message: "Not found" });
        res.json({ ok: true });
    }
);

router.post(
    "/:id/image",
    requireAuth,
    requireRole("admin", "manager"),
    upload.single("image"),
    async (req, res) => {
        const s = await Shift.findById(req.params.id);
        if (!s) return res.status(404).json({ message: "Not found" });
        s.imageUrl = req.file
            ? normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`)
            : normalizeMediaUrl(s.imageUrl);
        s.imageFit = req.body.imageFit || s.imageFit;
        s.imagePosition = req.body.imagePosition || s.imagePosition;
        await s.save();
        res.json(normalizeMediaFields(s.toObject(), ["imageUrl"], resolveMediaHost(req)));
    }
);

export default router;
