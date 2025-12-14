import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema(
    {
        slug: { type: String, unique: true, required: true },

        hero: {
            title: String,
            subtitle: String,
            description: String,
            cta: String,
            showRocket: { type: Boolean, default: true }
        },

        about: {
            title: String,
            text: String,
        },

        experience: {
            title: String,
            text: String
        },

        stats: [
            {
                label: String,
                value: String
            }
        ],

        itDirections: [
            {
                title: String,
                description: String
            }
        ],

        expectations: {
            title: String,
            items: [String]
        },

        schedule: {
            title: String,
            items: [[String]] // ["08:00", ""]
        },

        finalCta: {
            title: String,
            text: String,
            cta: String
        },

        bookingForm: {
            title: String,
            subtitle: String,
            consentText: String,
        },

        contacts: {
            title: String,
            phone: String,
            email: String,
            address: String,
            vkUrl: String,
            map: {
                lat: Number,
                lng: Number,
                zoom: Number
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Content", ContentSchema);
