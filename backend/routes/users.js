import express from "express";
import { body } from "express-validator";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const ADMIN_DELETE_SECRET = process.env.ADMIN_DELETE_SECRET || "Y@*<R.RW1zN$Zp6O,oerG~R";

router.use(requireAuth);

router.get("/", requireRole("admin"), async (req, res) => {
    const users = await User.find().select("_id email role createdAt").sort({ createdAt: -1 });
    res.json(users);
});

router.post(
    "/",
    [
        body("email").isEmail(),
        body("password").isString().isLength({ min: 6 }),
        body("role").isIn(["admin", "manager", "editor", "viewer"])
    ],
    requireRole("admin"),
    validate,
    async (req, res) => {
        const { email, password, role } = req.body;
        const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (exists) return res.status(409).json({ message: "Email already exists" });

        const u = new User({ email: String(email).toLowerCase().trim(), role });
        await u.setPassword(password);
        await u.save();

        res.json({ id: u._id, email: u.email, role: u.role });
    }
);

router.patch(
    "/:id/role",
    [body("role").isIn(["admin", "manager", "editor", "viewer"])],
    requireRole("admin"),
    validate,
    async (req, res) => {
        const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        if (!u) return res.status(404).json({ message: "Not found" });
        res.json({ id: u._id, email: u.email, role: u.role });
    }
);

router.post(
    "/:id/reset-password",
    [
        body("password").isString().isLength({ min: 6 }),
        body("oldPassword").isString().isLength({ min: 6 })
    ],
    validate,
    async (req, res) => {
        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "Not found" });

        const isAdmin = req.user?.role === "admin";
        const isSelf = String(req.user?.id) === String(u._id);

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: "Недостаточно прав" });
        }

        const oldPassword = req.body.oldPassword;
        if (!oldPassword) {
            return res.status(400).json({ message: "Укажите старый пароль" });
        }
        const matches = await u.verifyPassword(oldPassword);
        if (!matches) {
            return res.status(400).json({ message: "Старый пароль неверен" });
        }

        await u.setPassword(req.body.password);
        await u.save();
        res.json({ ok: true });
    }
);

router.delete(
    "/:id",
    [body("secret").isString().notEmpty()],
    requireRole("admin"),
    validate,
    async (req, res) => {
        if (req.body.secret !== ADMIN_DELETE_SECRET) {
            return res.status(403).json({ message: "Неверный секрет" });
        }

        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "Not found" });

        await u.deleteOne();
        res.json({ ok: true });
    }
);

export default router;
