import express from "express";
import { body, query } from "express-validator";
import Booking from "../models/Booking.js";
import Shift from "../models/Shift.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { privacyForViewer } from "../middleware/privacy.js";
import { toCSV, toXLSX } from "../utils/export.js";
import XLSX from "xlsx";
import jwt from "jsonwebtoken";

const router = express.Router();

const bookingValidators = [
    body("email").isEmail(),
    body("shiftId").optional().isString(),
    body("shiftTitle").isString().notEmpty(),

    body("childFullName").isString().notEmpty(),
    body("dob").isISO8601(),
    body("age").isInt({ min: 1, max: 21 }),
    body("gender").isIn(["М", "Ж"]),

    body("parentFullName").isString().notEmpty(),
    body("parentPhone").matches(/^(\+7|8)9\d{9}$/),
    body("parent2FullName").optional({ checkFalsy: true }).isString(),
    body("parent2Phone").optional({ checkFalsy: true }).matches(/^(\+7|8)9\d{9}$/),

    body("address").isString().notEmpty(),
    body("roommates").isString().notEmpty(),
    body("district").isString().notEmpty(),

    body("paymentType").default("certificate").isIn(["certificate", "full"]),
    body("allergies").isString().notEmpty(),
    body("transfer").isIn(["Да", "Нет"]),
];

/* PUBLIC: submit booking */
router.post(
    "/",
    [
        ...bookingValidators,
        body("agree").isBoolean().custom(v => v === true)
    ],
    validate,
    async (req, res) => {
        const { shiftId, shiftTitle: shiftTitleRaw } = req.body;
        let shift = null;
        let shiftTitle = (shiftTitleRaw || "").trim();

        if (shiftId) {
            shift = await Shift.findById(shiftId);
            if (shift) shiftTitle = shift.title;
        }

        const booking = await Booking.create({
            email: req.body.email,
            shift: shift ? shift._id : null,
            shiftTitle: shiftTitle || "Смена",

            childFullName: req.body.childFullName,
            dob: new Date(req.body.dob),
            age: req.body.age,
            gender: req.body.gender,

            parentFullName: req.body.parentFullName,
            parentPhone: req.body.parentPhone,
            parent2FullName: req.body.parent2FullName || "",
            parent2Phone: req.body.parent2Phone || "",

            address: req.body.address,
            roommates: req.body.roommates,
            district: req.body.district,

            paymentType: req.body.paymentType,
            allergies: req.body.allergies,
            transfer: req.body.transfer,
            agree: true,
        });

        res.json({ ok: true, id: booking._id });
    }
);

router.put(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    [...bookingValidators, body("agree").optional().isBoolean(), body("status").optional().isIn(["active", "archived"])],
    validate,
    async (req, res) => {
        const { shiftId, shiftTitle: shiftTitleRaw } = req.body;
        let shift = null;
        let shiftTitle = (shiftTitleRaw || "").trim();

        if (shiftId) {
            shift = await Shift.findById(shiftId);
            if (shift) shiftTitle = shift.title;
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Not found" });

        booking.email = req.body.email;
        booking.shift = shift ? shift._id : null;
        booking.shiftTitle = shiftTitle || booking.shiftTitle;
        booking.childFullName = req.body.childFullName;
        booking.dob = new Date(req.body.dob);
        booking.age = req.body.age;
        booking.gender = req.body.gender;
        booking.parentFullName = req.body.parentFullName;
        booking.parentPhone = req.body.parentPhone;
        booking.parent2FullName = req.body.parent2FullName || "";
        booking.parent2Phone = req.body.parent2Phone || "";
        booking.address = req.body.address;
        booking.roommates = req.body.roommates;
        booking.district = req.body.district;
        booking.paymentType = req.body.paymentType;
        booking.allergies = req.body.allergies;
        booking.transfer = req.body.transfer;
        if (typeof req.body.agree === "boolean") booking.agree = req.body.agree;
        if (req.body.status) booking.status = req.body.status;

        await booking.save();

        res.json(booking);
    }
);

/* ADMIN LIST */
router.get(
    "/",
    requireAuth,
    requireRole("admin", "manager", "viewer"),
    privacyForViewer,
    [
        query("status").optional().isIn(["active", "archived"]),
        query("shiftId").optional().isString(),
        query("q").optional().isString(),
        query("from").optional().isString(),
        query("to").optional().isString()
    ],
    validate,
    async (req, res) => {
        const { status = "active", shiftId, q, from, to } = req.query;

        const filter = { status };
        if (shiftId) filter.shift = shiftId;

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const d = new Date(to);
                d.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = d;
            }
        }

        if (q) filter.$text = { $search: q };

        const items = await Booking.find(filter)
            .populate("shift", "title")
            .sort({ createdAt: -1 })
            .limit(500);

        res.json(items);
    }
);

/* archive / restore */
router.patch("/:id/archive", requireAuth, requireRole("admin", "manager"), async (req, res) => {
    const b = await Booking.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
    if (!b) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
});

router.patch("/:id/restore", requireAuth, requireRole("admin", "manager"), async (req, res) => {
    const b = await Booking.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true });
    if (!b) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
});

/* export CSV/XLSX */
router.get("/export", requireAuth, requireRole("admin", "manager"), async (req, res) => {
    const { format = "xlsx", status = "active" } = req.query;

    const items = await Booking.find({ status })
        .populate("shift", "title")
        .sort({ createdAt: -1 })
        .limit(5000);

    const rows = items.map(b => ({
        createdAt: b.createdAt.toISOString(),
        status: b.status,
        email: b.email,
        shift: b.shift?.title || b.shiftTitle,
        childFullName: b.childFullName,
        dob: b.dob,
        age: b.age,
        gender: b.gender,
        parentFullName: b.parentFullName,
        parentPhone: b.parentPhone,
        parent2FullName: b.parent2FullName,
        parent2Phone: b.parent2Phone,
        address: b.address,
        roommates: b.roommates,
        district: b.district,
        paymentType: b.paymentType,
        allergies: b.allergies,
        transfer: b.transfer,
        agree: b.agree
    }));

    if (String(format).toLowerCase() === "csv") {
        const csv = toCSV(rows);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=bookings.csv");
        return res.send(csv);
    }

    const buf = await toXLSX(rows, "Bookings");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");
    res.send(Buffer.from(buf));
});

/* ===== EXPORT BOOKINGS TO EXCEL ===== */
router.get("/export/excel", async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const tokenFromQuery = req.query.token;
    const token = authHeader.replace("Bearer ", "") || tokenFromQuery;

    if (!token) return res.status(401).json({ message: "Нет токена" });

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: "Неверный токен" });
    }

    if (!payload?.role || !["admin", "manager"].includes(payload.role)) {
        return res.status(403).json({ message: "Недостаточно прав" });
    }

    const { status = "active", shiftId, q, from, to } = req.query;

    const filter = { status: status === "archived" ? "archived" : "active" };
    if (shiftId) filter.shift = shiftId;
    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) {
            const d = new Date(to);
            d.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = d;
        }
    }
    if (q) filter.$text = { $search: q };

    const bookings = await Booking.find(filter)
        .populate("shift", "title")
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();

    const rows = bookings.map((b, i) => ({
        "№": i + 1,
        "Дата заявки": new Date(b.createdAt).toLocaleDateString(),
        "Email": b.email,
        "Смена": b.shift?.title || b.shiftTitle,

        "Ребёнок": b.childFullName,
        "Дата рождения": b.dob
            ? new Date(b.dob).toLocaleDateString()
            : "",
        "Возраст": b.age,
        "Пол": b.gender,

        "Родитель": b.parentFullName,
        "Телефон": b.parentPhone,

        "Второй родитель": b.parent2FullName || "",
        "Телефон 2": b.parent2Phone || "",

        "Адрес": b.address,
        "Район школы": b.district,
        "Друзья": b.roommates,

        "Оплата": b.paymentType === "certificate"
            ? "Сертификат"
            : "Полная",

        "Аллергии": b.allergies,
        "Трансфер": b.transfer,
        "Статус": b.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Заявки");

    const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    });

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=bookings.xlsx"
    );
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
});

export default router;
