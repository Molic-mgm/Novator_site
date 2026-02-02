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
        },

        aboutBlocks: [
            {
                title: String,
                text: String,
                imageUrl: String,
                group: String,
                groupOrder: { type: Number, default: 0 },
                order: { type: Number, default: 0 },
                isActive: { type: Boolean, default: true }
            }
        ],

        programs: [
            {
                key: String,
                title: String,
                description: String,
                order: { type: Number, default: 0 },
                isActive: { type: Boolean, default: true },
                directions: [
                    {
                        title: String,
                        description: String,
                        imageUrl: String,
                        order: { type: Number, default: 0 },
                        isActive: { type: Boolean, default: true }
                    }
                ]
            }
        ],

        parentsSections: [
            {
                slug: String,
                title: String,
                body: String,
                imageUrl: String,
                listItems: [String],
                listGroups: {
                    allowed: [String],
                    disallowed: [String],
                    conditional: [String]
                },
                files: [
                    {
                        title: String,
                        url: String
                    }
                ],
                order: { type: Number, default: 0 },
                isActive: { type: Boolean, default: true }
            }
        ],

        documents: [
            {
                title: String,
                description: String,
                date: String,
                fileUrl: String,
                imageUrl: String,
                order: { type: Number, default: 0 },
                isActive: { type: Boolean, default: true }
            }
        ],

        menu: [
            {
                title: String,
                path: String,
                parentId: String,
                order: { type: Number, default: 0 },
                isActive: { type: Boolean, default: true }
            }
        ],

        shiftsHero: {
            title: String,
            subtitle: String,
            imageUrl: String,
            imageFit: { type: String, default: "cover" },
            imagePosition: { type: String, default: "center center" }
        },

        pageHeaders: {
            about: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            programs: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            parents: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            documents: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            vacancies: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            team: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            gallery: {
                eyebrow: String,
                title: String,
                subtitle: String
            },
            shifts: {
                eyebrow: String,
                title: String,
                subtitle: String
            }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Content", ContentSchema);
