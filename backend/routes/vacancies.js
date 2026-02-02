import express from "express";
import { body } from "express-validator";
import Vacancy from "../models/Vacancy.js";
import VacancyResponse from "../models/VacancyResponse.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", async (_req, res) => {
    const items = await Vacancy.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    res.json(items);
});

router.get("/admin", requireAuth, requireRole("admin", "manager"), async (_req, res) => {
    const items = await Vacancy.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json(items);
});

router.post(
    "/",
    requireAuth,
    requireRole("admin", "manager"),
    [body("title").isString().notEmpty(), body("description").optional().isString()],
    validate,
    async (req, res) => {
        const vacancy = await Vacancy.create({
            title: req.body.title,
            description: req.body.description || "",
            order: req.body.order !== undefined ? Number(req.body.order) : 0,
            isActive: req.body.isActive !== false,
        });
        res.json(vacancy);
    }
);

router.patch(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const payload = { ...req.body };
        if (payload.order !== undefined) payload.order = Number(payload.order);
        const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!vacancy) return res.status(404).json({ message: "Not found" });
        res.json(vacancy);
    }
);

router.delete(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
        if (!vacancy) return res.status(404).json({ message: "Not found" });
        await VacancyResponse.deleteMany({ vacancy: req.params.id });
        res.json({ ok: true });
    }
);

router.post(
    "/:id/responses",
    [
        body("fullName").isString().notEmpty(),
        body("email").isEmail(),
        body("phone").isString().notEmpty(),
        body("message").optional().isString(),
    ],
    validate,
    async (req, res) => {
        const vacancy = await Vacancy.findById(req.params.id);
        if (!vacancy || !vacancy.isActive) {
            return res.status(404).json({ message: "Vacancy not found" });
        }
        const response = await VacancyResponse.create({
            vacancy: vacancy._id,
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            message: req.body.message || "",
        });
        res.json({ ok: true, id: response._id });
    }
);

router.get("/responses", requireAuth, requireRole("admin", "manager"), async (_req, res) => {
    const items = await VacancyResponse.find()
        .populate("vacancy", "title")
        .sort({ createdAt: -1 })
        .limit(1000);
    res.json(items);
});

export default router;
