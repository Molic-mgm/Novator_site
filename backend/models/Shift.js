import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        dates: { type: String, default: "" },
        price: { type: String, default: "" },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" }, // /uploads/...
        imageFit: { type: String, enum: ["cover", "contain"], default: "cover" },
        imagePosition: {
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
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model("Shift", schema);
