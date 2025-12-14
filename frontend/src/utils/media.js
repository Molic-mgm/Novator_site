import { API_BASE_URL } from "./api";

const mediaBaseRaw = (import.meta.env.VITE_MEDIA_URL || API_BASE_URL || "http://localhost:4000")
    .replace(/\/$/, "")
    .replace(/\/api$/, "");

export const MEDIA_BASE_URL = mediaBaseRaw;

export function toAbsoluteUrl(url) {
    if (!url) return "";

    const cleaned = String(url).trim().replace(/\\/g, "/");
    if (/^https?:\/\//i.test(cleaned)) return cleaned;

    const path = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    try {
        const resolved = new URL(path, `${MEDIA_BASE_URL}/`).toString();
        return resolved.replace(/\/$/, path.endsWith("/") ? "/" : "");
    } catch {
        return path;
    }
}
