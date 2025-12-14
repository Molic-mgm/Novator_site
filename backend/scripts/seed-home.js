import mongoose from "mongoose";
import Content from "../models/Content.js";
import dotenv from "dotenv";

dotenv.config();

async function seedHome() {
    await mongoose.connect(process.env.MONGO_URI);

    await Content.deleteOne({ slug: "home" });

    await Content.create({
        slug: "home",
        hero: {
            title: "Детский IT лагерь «НОВАТОР»",
            subtitle: "Инновационный детский лагерь",
            description:
                "Присоединяйтесь к нам и станьте частью нового поколения новаторов!",
            cta: "Забронировать"
        },
        experience: {
            title: "Наш опыт",
            text:
                "С 2012 года мы создаём пространство, где дети не просто отдыхают, " +
                "а раскрывают свои таланты, находят друзей и учатся чему-то новому."
        },
        stats: [
            { label: "Лет опыта", value: "14+" },
            { label: "Детей", value: "3000+" },
            { label: "Смен", value: "120+" },
            { label: "Направлений", value: "10+" }
        ],
        itDirections: [
            { title: "Программирование", description: "Python, Scratch, основы алгоритмов" },
            { title: "Робототехника", description: "Конструирование и управление роботами" },
            { title: "Геймдев", description: "Создание игр и интерактивных миров" },
            { title: "Дизайн", description: "UI/UX, графика, визуальное мышление" }
        ],
        expectations: {
            title: "Что ждёт детей",
            items: [
                "Проектная работа",
                "Командные активности",
                "IT-наставники",
                "Спортивные и творческие мероприятия",
                "Новые друзья и впечатления"
            ]
        },
        schedule: {
            title: "Распорядок дня",
            items: [
                ["08:00", "Подъём"],
                ["08:30", "Зарядка"],
                ["09:00", "Завтрак"],
                ["10:00", "IT-занятия"],
                ["13:00", "Обед"],
                ["14:00", "Проекты / активности"],
                ["18:00", "Ужин"],
                ["20:00", "Вечерняя программа"]
            ]
        },
        finalCta: {
            title: "Готовы стать новатором?",
            text: "Оставьте заявку и мы свяжемся с вами для бронирования путёвки.",
            cta: "Оставить заявку"
        },
        contacts: {
            title: "Контакты",
            phone: "+7 (999) 123-45-67",
            email: "info@novatorcamp.ru",
            address: "г. Уфа, Республика Башкортостан",
            vkUrl: "https://vk.com/novatorcamp",
            map: { lat: 54.7388, lng: 55.9721, zoom: 12 }
        }
    });

    console.log("✅ Home content seeded");
    process.exit();
}

seedHome();
