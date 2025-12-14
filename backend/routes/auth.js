import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const attempts = new Map();
const MAX_ATTEMPTS = 3;
const BLOCK_MS = 15 * 60 * 1000;

async function verifyCaptcha(token, ip) {
  const DEFAULT_SECRET =
    process.env.HCAPTCHA_DEFAULT_SECRET ||
    "0x0000000000000000000000000000000000000000";
  const secret = process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_KEY || DEFAULT_SECRET;
  const captchaDisabled =
    String(process.env.HCAPTCHA_BYPASS || "").toLowerCase() === "true";

  if (captchaDisabled) return true;
  if (!token) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const params = new URLSearchParams({ secret, response: token });
    if (ip) params.set("remoteip", ip);
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      body: params,
      signal: controller.signal,
    });
    const data = await res.json();
    return !!data?.success;
  } catch (e) {
    console.error("Captcha verify failed", e.message);
    // allow login when captcha provider is unreachable to avoid hard lockout
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

const router = express.Router();

/* ===== LOGIN ===== */
router.post("/login", async (req, res) => {
  const { email, password, captchaToken } = req.body;
  const ip = req.ip;

  const info = attempts.get(ip) || { count: 0, until: 0 };
  if (info.until && info.until > Date.now()) {
    const minutesLeft = Math.ceil((info.until - Date.now()) / 60000);
    return res.status(429).json({ message: `Слишком много попыток. Повторите через ${minutesLeft} мин (блокировка 15 минут после 3 ошибок)` });
  }
  if (info.until && info.until <= Date.now()) {
    attempts.set(ip, { count: 0, until: 0 });
  }

  const captchaOk = await verifyCaptcha(captchaToken, ip);
  if (!captchaOk) {
    return res.status(400).json({ message: "Подтвердите, что вы не робот" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    const next = info.count + 1;
    attempts.set(ip, { count: next, until: next >= MAX_ATTEMPTS ? Date.now() + BLOCK_MS : 0 });
    return res.status(401).json({ message: "Неверные данные" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const next = info.count + 1;
    attempts.set(ip, { count: next, until: next >= MAX_ATTEMPTS ? Date.now() + BLOCK_MS : 0 });
    return res.status(401).json({ message: "Неверные данные" });
  }

  attempts.delete(ip);

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
