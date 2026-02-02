import mongoose from "mongoose";

const VacancyResponseSchema = new mongoose.Schema(
    {
        vacancy: { type: mongoose.Schema.Types.ObjectId, ref: "Vacancy", required: true },
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        message: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("VacancyResponse", VacancyResponseSchema);
