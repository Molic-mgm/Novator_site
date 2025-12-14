import express from "express";

const router = express.Router();

// Public configuration values that are safe to expose to the frontend
router.get("/public", (req, res) => {
  const hcaptchaSiteKey =
    process.env.HCAPTCHA_SITE_KEY ||
    process.env.HCAPTCHA_SITEKEY ||
    process.env.VITE_HCAPTCHA_SITEKEY ||
    "";

  const hasSecret = Boolean(
    process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_KEY || ""
  );

  const hcaptchaEnabled = Boolean(hcaptchaSiteKey && hasSecret);

  res.json({ hcaptchaSiteKey, hcaptchaEnabled });
});

export default router;
