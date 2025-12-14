import express from "express";
import Content from "../models/Content.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/content/contacts
 */
router.get("/contacts", async (req, res) => {
    const content = await findOrCreateHome();
    res.json({ contacts: content.contacts });
});

/**
 * PUT /api/content/contacts
 */
router.put("/contacts", requireAuth, async (req, res) => {
    const content = await findOrCreateHome();

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
        const { slug } = req.params;

        const content =
            slug === "home"
                ? await findOrCreateHome()
                : await Content.findOne({ slug });

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        const data = content.toObject();
        const normalized = slug === "home" ? mergeAboutExperience(data) : data;

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

async function findOrCreateHome() {
    const existing = await Content.findOne({ slug: "home" });
    if (existing) return existing;

    const baseAbout = {
        title: "Наш опыт",
        text: "С 2012 года мы создаём пространство для роста и дружбы.",
    };

    const created = await Content.create({
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
        contacts: {},
    });

    return created;
}

export default router;
