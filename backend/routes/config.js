import express from "express";

const router = express.Router();

const DEFAULT_SECRET = "1898a4f4-6000-49a4-87cc-a456c0dcf766";

// Public configuration values that are safe to expose to the frontend
router.get("/public", (req, res) => {
    const hcaptchaSiteKey =
        process.env.HCAPTCHA_SITE_KEY ||
        process.env.HCAPTCHA_SITEKEY ||
        process.env.VITE_HCAPTCHA_SITEKEY ||
        "";

    const secret = process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_KEY || "";
    const bypass = String(process.env.HCAPTCHA_BYPASS || "").toLowerCase() === "true";
    const hcaptchaRequired = Boolean(secret) && secret !== DEFAULT_SECRET && !bypass;

    res.json({ hcaptchaSiteKey, hcaptchaRequired });
});

export default router;
