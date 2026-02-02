import express from "express";
import GalleryAlbum from "../models/GalleryAlbum.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { createUploader, uploadDir } from "../utils/upload.js";
import { normalizeMediaFields, normalizeMediaUrl, resolveMediaHost } from "../utils/media.js";
import { deleteMediaIfUnused, normalizeMediaPath } from "../utils/mediaCleanup.js";

const router = express.Router();
const uploadCover = createUploader("gallery-cover");
const uploadPhoto = createUploader("gallery-photo");
const uploadVideo = createUploader("gallery-video");

const parseBoolean = (value, fallback) => {
    if (value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return fallback;
};

router.get("/", async (req, res) => {
    const albums = await GalleryAlbum.find().sort({ order: 1, createdAt: -1 }).lean();
    const mediaHost = resolveMediaHost(req);

    const normalized = albums.map((a) =>
        normalizeMediaFields(
            {
                ...a,
                coverFit: a.coverFit || "contain",
                coverPosition: a.coverPosition || "center center",
            },
            ["coverUrl", "photos", "videos"],
            mediaHost
        )
    );

    res.json(normalized);
});

router.get("/:id", async (req, res) => {
    const album = await GalleryAlbum.findById(req.params.id).lean();
    if (!album) return res.status(404).json({ message: "Album not found" });

    res.json(
        normalizeMediaFields(
            {
                ...album,
                coverFit: album.coverFit || "contain",
                coverPosition: album.coverPosition || "center center",
            },
            ["coverUrl", "photos", "videos"],
            resolveMediaHost(req)
        )
    );
});

router.post(
    "/",
    requireAuth,
    requireRole("admin", "manager"),
    uploadCover.single("cover"),
    async (req, res) => {
        const coverUrl = req.file ? `/${uploadDir}/${req.file.filename}` : req.body.coverUrl || "";
        const album = await GalleryAlbum.create({
            title: req.body.title,
            description: req.body.description || "",
            coverUrl: normalizeMediaUrl(coverUrl),
            coverFit: req.body.coverFit || "contain",
            coverPosition: req.body.coverPosition || "center center",
            order: req.body.order !== undefined ? Number(req.body.order) : 0,
            isActive: parseBoolean(req.body.isActive, true),
            photos: [],
            videos: [],
        });

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

router.patch(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    uploadCover.single("cover"),
    async (req, res) => {
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });

        const previousCover = album.coverUrl;
        album.title = req.body.title ?? album.title;
        album.description = req.body.description ?? album.description;
        album.coverFit = req.body.coverFit ?? album.coverFit;
        album.coverPosition = req.body.coverPosition ?? album.coverPosition;
        if (req.body.order !== undefined) album.order = Number(req.body.order);
        if (req.body.isActive !== undefined) {
            album.isActive = parseBoolean(req.body.isActive, album.isActive);
        }
        if (req.body.photos) {
            const photos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
            album.photos = photos.map(normalizeMediaUrl);
        }
        if (req.body.videos) {
            const videos = Array.isArray(req.body.videos) ? req.body.videos : [req.body.videos];
            album.videos = videos.map(normalizeMediaUrl);
        }
        if (req.file) album.coverUrl = normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`);
        if (req.body.coverUrl) album.coverUrl = normalizeMediaUrl(req.body.coverUrl);

        await album.save();
        if (previousCover && previousCover !== album.coverUrl) {
            await deleteMediaIfUnused(previousCover);
        }
        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

router.delete(
    "/:id",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const album = await GalleryAlbum.findByIdAndDelete(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
        const mediaToDelete = [album.coverUrl, ...(album.photos || []), ...(album.videos || [])];
        await deleteMediaIfUnused(mediaToDelete);
        res.json({ success: true });
    }
);

router.post(
    "/:id/photos",
    requireAuth,
    requireRole("admin", "manager"),
    uploadPhoto.array("photos", 10),
    async (req, res) => {
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });

        const uploaded = (req.files || [])
            .map((f) => normalizeMediaUrl(`/${uploadDir}/${f.filename}`));
        const incoming = (req.body.photos
            ? Array.isArray(req.body.photos)
                ? req.body.photos
                : [req.body.photos]
            : []
        ).map(normalizeMediaUrl);

        album.photos.push(...uploaded, ...incoming.filter(Boolean));
        await album.save();

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

router.delete(
    "/:id/photos",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const { photoUrl } = req.body || {};
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
        if (!photoUrl) return res.status(400).json({ message: "Photo URL is required" });

        const target = normalizeMediaPath(photoUrl);
        const removed = (album.photos || []).filter((p) => normalizeMediaPath(p) === target);
        if (removed.length === 0) return res.status(404).json({ message: "Photo not found in album" });

        album.photos = (album.photos || []).filter((p) => normalizeMediaPath(p) !== target);
        await album.save();
        await deleteMediaIfUnused(removed);

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

router.post(
    "/:id/videos",
    requireAuth,
    requireRole("admin", "manager"),
    uploadVideo.array("videos", 6),
    async (req, res) => {
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });

        const uploaded = (req.files || [])
            .map((f) => normalizeMediaUrl(`/${uploadDir}/${f.filename}`));
        const incoming = (req.body.videos
            ? Array.isArray(req.body.videos)
                ? req.body.videos
                : [req.body.videos]
            : []
        ).map(normalizeMediaUrl);

        album.videos.push(...uploaded, ...incoming.filter(Boolean));
        await album.save();

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

router.delete(
    "/:id/videos",
    requireAuth,
    requireRole("admin", "manager"),
    async (req, res) => {
        const { videoUrl } = req.body || {};
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ message: "Album not found" });
        if (!videoUrl) return res.status(400).json({ message: "Video URL is required" });

        const target = normalizeMediaPath(videoUrl);
        const removed = (album.videos || []).filter((v) => normalizeMediaPath(v) === target);
        if (removed.length === 0) return res.status(404).json({ message: "Video not found in album" });

        album.videos = (album.videos || []).filter((v) => normalizeMediaPath(v) !== target);
        await album.save();
        await deleteMediaIfUnused(removed);

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos", "videos"], resolveMediaHost(req))
        );
    }
);

export default router;
