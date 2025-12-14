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

router.get("/", async (req, res) => {
    const albums = await GalleryAlbum.find().sort({ createdAt: -1 }).lean();
    const mediaHost = resolveMediaHost(req);

    const normalized = albums.map((a) =>
        normalizeMediaFields(
            {
                ...a,
                coverFit: a.coverFit || "contain",
                coverPosition: a.coverPosition || "center center",
            },
            ["coverUrl", "photos"],
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
            ["coverUrl", "photos"],
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
            photos: [],
        });

        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos"], resolveMediaHost(req))
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
        if (req.file) album.coverUrl = normalizeMediaUrl(`/${uploadDir}/${req.file.filename}`);
        if (req.body.coverUrl) album.coverUrl = normalizeMediaUrl(req.body.coverUrl);

        await album.save();
        if (previousCover && previousCover !== album.coverUrl) {
            await deleteMediaIfUnused(previousCover);
        }
        res.json(
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos"], resolveMediaHost(req))
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
        const mediaToDelete = [album.coverUrl, ...(album.photos || [])];
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
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos"], resolveMediaHost(req))
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
            normalizeMediaFields(album.toObject(), ["coverUrl", "photos"], resolveMediaHost(req))
        );
    }
);

export default router;
