import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, trim: true },

        shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", default: null },
        shiftTitle: { type: String, required: true, trim: true },

        childFullName: { type: String, required: true, trim: true },
        dob: { type: Date, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ["М", "Ж"], required: true },

        parentFullName: { type: String, required: true, trim: true },
        parentPhone: { type: String, required: true, trim: true },

        parent2FullName: { type: String, trim: true, default: "" },
        parent2Phone: { type: String, trim: true, default: "" },

        address: { type: String, required: true, trim: true },
        roommates: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },

        paymentType: {
            type: String,
            enum: ["certificate", "full"],
            required: true,
        },

        allergies: { type: String, required: true, trim: true },
        transfer: { type: String, enum: ["Да", "Нет"], required: true },
        agree: { type: Boolean, default: false },

        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
        },
    },
    { timestamps: true }
);

BookingSchema.index({
    email: "text",
    childFullName: "text",
    parentFullName: "text",
    parentPhone: "text",
});

export default mongoose.model("Booking", BookingSchema);
