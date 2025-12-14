import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        position: { type: String, default: "" },
        photoUrl: { type: String, default: "" },
        photoFit: { type: String, enum: ["cover", "contain"], default: "cover" },
        photoPosition: {
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
        description: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("TeamMember", TeamMemberSchema);
