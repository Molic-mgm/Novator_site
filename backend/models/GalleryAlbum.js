import mongoose from "mongoose";

const GalleryAlbumSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        coverUrl: { type: String, default: "" },
        coverFit: { type: String, enum: ["cover", "contain"], default: "contain" },
        coverPosition: {
            type: String,
            enum: [
                "center center",
                "top center",
                "bottom center",
                "center left",
                "center right",
            ],
            default: "center center",
        },
        photos: [String],
    },
    { timestamps: true }
);

GalleryAlbumSchema.index({ title: "text", description: "text" });

export default mongoose.model("GalleryAlbum", GalleryAlbumSchema);
