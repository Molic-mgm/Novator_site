import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import GalleryAlbum from "../models/GalleryAlbum.js";
import TeamMember from "../models/TeamMember.js";
import { uploadDir } from "./upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPrefix = `/${uploadDir.replace(/^\/+|\/+$/g, "")}`;

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeMediaPath(url = "") {
    if (!url) return "";

    const cleaned = String(url).trim().replace(/\\\\/g, "/").split("?")[0];

    try {
        const parsed = new URL(cleaned, "http://placeholder");
        return parsed.pathname.replace(/\/$/, "");
    } catch (_err) {
        const withoutProtocol = cleaned.replace(/^https?:\/\//i, "");
        const withSlash = withoutProtocol.startsWith("/") ? withoutProtocol : `/${withoutProtocol}`;
        return withSlash.replace(/\/$/, "");
    }
}

async function isMediaUsed(normalizedPath) {
    const regex = new RegExp(`${escapeRegExp(normalizedPath)}$`, "i");

    const inGallery = await GalleryAlbum.exists({
        $or: [
            { coverUrl: { $regex: regex } },
            { photos: { $elemMatch: { $regex: regex } } },
        ],
    });
    if (inGallery) return true;

    const inTeam = await TeamMember.exists({ photoUrl: { $regex: regex } });
    return Boolean(inTeam);
}

export async function deleteMediaIfUnused(urls) {
    const list = Array.isArray(urls) ? urls : [urls];
    const unique = Array.from(new Set(list.filter(Boolean)));

    for (const rawUrl of unique) {
        const normalized = normalizeMediaPath(rawUrl);
        if (!normalized || !normalized.startsWith(uploadPrefix)) continue;

        const stillUsed = await isMediaUsed(normalized);
        if (stillUsed) continue;

        const absolutePath = path.resolve(__dirname, "..", normalized.replace(/^\//, ""));
        try {
            await fs.unlink(absolutePath);
        } catch (err) {
            if (err?.code !== "ENOENT") {
                console.error(`Failed to delete unused media at ${absolutePath}`, err);
            }
        }
    }
}
