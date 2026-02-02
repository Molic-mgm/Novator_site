import express from "express";
import Content from "../models/Content.js";
import { requireAuth } from "../middleware/auth.js";
import { DEFAULT_CONTACTS } from "../utils/defaultContacts.js";

const router = express.Router();

/**
 * GET /api/content/contacts
 */
router.get("/contacts", async (req, res) => {
    const content = await findOrCreateHome();
    const contacts = mergeContacts(content.contacts);
    res.json({ contacts });
});

/**
 * PUT /api/content/contacts
 */
router.put("/contacts", requireAuth, async (req, res) => {
    const content = await findOrCreateHome();

    content.contacts = mergeContacts(req.body || {});
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
                : slug === "site"
                ? await findOrCreateSite()
                : await Content.findOne({ slug });

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        const data = content.toObject();
        const normalized =
            slug === "home"
                ? { ...mergeAboutExperience(data), contacts: mergeContacts(data.contacts) }
                : data;

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

function mergeContacts(value = {}) {
    return {
        ...DEFAULT_CONTACTS,
        ...(value || {}),
        map: {
            ...DEFAULT_CONTACTS.map,
            ...((value || {}).map || {}),
        },
    };
}

async function findOrCreateHome() {
    const existing = await Content.findOne({ slug: "home" });
    if (existing) {
        if (!existing.contacts || Object.keys(existing.contacts || {}).length === 0) {
            existing.contacts = DEFAULT_CONTACTS;
            await existing.save();
        }
        return existing;
    }

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
        contacts: DEFAULT_CONTACTS,
    });

    return created;
}

async function findOrCreateSite() {
    const existing = await Content.findOne({ slug: "site" });
    if (existing) return existing;

    return Content.create({
        slug: "site",
        aboutBlocks: [
            {
                title: "Месторасположение",
                text: "Описание месторасположения лагеря.",
                imageUrl: "",
                group: "Основная информация",
                groupOrder: 1,
                order: 1,
                isActive: true,
            },
            {
                title: "Безопасность",
                text: "Описание мер безопасности.",
                imageUrl: "",
                group: "Основная информация",
                groupOrder: 1,
                order: 2,
                isActive: true,
            },
        ],
        programs: [
            {
                key: "educational",
                title: "Воспитательная",
                description: "Описание программы.",
                order: 1,
                isActive: true,
                directions: [],
            },
            {
                key: "fitness",
                title: "Физкультурно-оздоровительная",
                description: "Описание программы.",
                order: 2,
                isActive: true,
                directions: [],
            },
            {
                key: "educational-development",
                title: "Образовательно-развивающая",
                description: "Описание программы.",
                order: 3,
                isActive: true,
                directions: [],
            },
            {
                key: "intellectual",
                title: "Интеллектуально-развлекательная",
                description: "Описание программы.",
                order: 4,
                isActive: true,
                directions: [],
            },
        ],
        parentsSections: [
            {
                slug: "medical",
                title: "Медтребования",
                body: "",
                imageUrl: "",
                listItems: [],
                listGroups: { allowed: [], disallowed: [], conditional: [] },
                files: [],
                order: 1,
                isActive: true,
            },
        ],
        documents: [],
        menu: [
            { title: "Главная", path: "/", order: 1, isActive: true },
            { title: "Смены", path: "/shifts", order: 2, isActive: true },
            { title: "О лагере", path: "/about", order: 3, isActive: true },
            { title: "Программы", path: "/programs", order: 4, isActive: true },
            { title: "Родителям", path: "/parents", order: 5, isActive: true },
            { title: "Команда", path: "/team", order: 6, isActive: true },
            { title: "Галерея", path: "/gallery", order: 7, isActive: true },
            { title: "Документы", path: "/documents", order: 8, isActive: true },
            { title: "Вакансии", path: "/vacancies", order: 9, isActive: true },
            { title: "Контакты", path: "/contacts", order: 10, isActive: true },
        ],
        shiftsHero: {
            title: "Наши смены",
            subtitle: "Выберите подходящую смену",
            imageUrl: "",
            imageFit: "cover",
            imagePosition: "center center",
        },
        schedule: {
            title: "Распорядок дня",
            items: [
                ["08:00", "Подъём"],
                ["08:30", "Зарядка"],
                ["09:00", "Завтрак"],
                ["10:00", "IT-занятия"],
                ["13:00", "Обед"],
                ["14:00", "Проекты / активности"],
                ["18:00", "Ужин"],
                ["20:00", "Вечерняя программа"],
            ],
        },
        pageHeaders: {
            about: {
                eyebrow: "О лагере",
                title: "Жизнь в «Новаторе»",
                subtitle: "Узнайте больше о безопасности, питании и распорядке дня.",
            },
            programs: {
                eyebrow: "Программы",
                title: "Направления лагеря",
                subtitle: "Четыре основных программы с возможностью добавлять направления.",
            },
            parents: {
                eyebrow: "Родителям",
                title: "Полезная информация",
                subtitle: "Документы, правила и требования для родителей и детей.",
            },
            documents: {
                eyebrow: "Документы",
                title: "Официальные документы",
                subtitle: "Лицензии, сертификаты и другие документы лагеря.",
            },
            vacancies: {
                eyebrow: "Вакансии",
                title: "Работа в лагере",
                subtitle: "Присоединяйтесь к команде «Новатора».",
            },
            team: {
                eyebrow: "Команда",
                title: "Наша команда",
                subtitle: "Сотрудники, которые делают смены особенными.",
            },
            gallery: {
                eyebrow: "Галерея",
                title: "Альбомы лагеря Новатор",
                subtitle: "Сохраняем яркие моменты с наших смен.",
            },
            shifts: {
                eyebrow: "Наши смены",
                title: "Доступные смены лагеря",
                subtitle: "Здесь отображаются смены, доступные для бронирования.",
            },
        },
    });
}

export default router;
