import express from "express";
import Content from "../models/Content.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/content/contacts
 */
router.get("/contacts", async (req, res) => {
    const content = await Content.findOne({ slug: "home" });
    if (!content) return res.status(404).json({ message: "Content not found" });
    res.json({ contacts: content.contacts });
});

/**
 * PUT /api/content/contacts
 */
router.put("/contacts", requireAuth, async (req, res) => {
    const content = await Content.findOne({ slug: "home" });
    if (!content) return res.status(404).json({ message: "Content not found" });

    content.contacts = req.body;
    await content.save();

    res.json({ success: true });
});

/**
 * GET /api/content/:slug
 * e.g. /api/content/home
 */
router.get("/:slug", async (req, res) => {
    try {
        const content = await Content.findOne({ slug: req.params.slug });
        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        const data = content.toObject();
        const normalized =
            req.params.slug === "home" ? mergeAboutExperience(data) : data;

        res.json(normalized);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * PUT /api/content/:slug
 *   updates any content block (CMS)
 */
router.put("/:slug", requireAuth, async (req, res) => {
    try {
        const payload =
            req.params.slug === "home"
                ? mergeAboutExperience(req.body || {})
                : req.body;

        const content = await Content.findOneAndUpdate(
            { slug: req.params.slug },
            payload,
            { new: true, upsert: true }
        );
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

function mergeAboutExperience(value) {
    const about = value.about || {};
    const experience = value.experience || {};

    const title = about.title || experience.title || "";
    const text = about.text || experience.text || "";

    return {
        ...value,
        about: { ...about, title, text },
        experience: { ...experience, title, text },
    };
}

export default router;
