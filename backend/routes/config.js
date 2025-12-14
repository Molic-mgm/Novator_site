import express from "express";

const router = express.Router();

// Public configuration values that are safe to expose to the frontend
router.get("/public", (req, res) => {
  const defaultSiteKey =
    process.env.HCAPTCHA_DEFAULT_SITEKEY ||
    "10000000-ffff-ffff-ffff-000000000001";
  const hcaptchaSiteKey =
    process.env.HCAPTCHA_SITE_KEY ||
    process.env.HCAPTCHA_SITEKEY ||
    process.env.VITE_HCAPTCHA_SITEKEY ||
    defaultSiteKey;

  const defaultSecret =
    process.env.HCAPTCHA_DEFAULT_SECRET ||
    "0x0000000000000000000000000000000000000000";
  const hasSecret = Boolean(
    (process.env.HCAPTCHA_SECRET || process.env.HCAPTCHA_KEY || defaultSecret).trim()
  );

  const hcaptchaEnabled = Boolean(hcaptchaSiteKey && hasSecret);

  res.json({ hcaptchaSiteKey, hcaptchaEnabled });
});

export default router;
