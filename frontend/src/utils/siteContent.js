export const DEFAULT_SITE_CONTENT = {
    aboutBlocks: [],
    programs: [],
    parentsSections: [],
    documents: [],
    menu: [],
    shiftsHero: {
        title: "Наши смены",
        subtitle: "Выберите подходящую смену",
        imageUrl: "",
        imageFit: "cover",
        imagePosition: "center center",
    },
    schedule: {
        title: "Распорядок дня",
        items: [],
    },
    pageHeaders: {
        about: {
            eyebrow: "О лагере",
            title: "Жизнь в «Новаторе»",
            subtitle: "Узнайте больше о безопасности, питании и распорядке дня.",
        },
        programs: {
            eyebrow: "Программы",
            title: "Направления лагеря",
            subtitle: "Четыре основных программы с возможностью добавлять направления.",
        },
        parents: {
            eyebrow: "Родителям",
            title: "Полезная информация",
            subtitle: "Документы, правила и требования для родителей и детей.",
        },
        documents: {
            eyebrow: "Документы",
            title: "Официальные документы",
            subtitle: "Лицензии, сертификаты и другие документы лагеря.",
        },
        vacancies: {
            eyebrow: "Вакансии",
            title: "Работа в лагере",
            subtitle: "Присоединяйтесь к команде «Новатора».",
        },
        team: {
            eyebrow: "Команда",
            title: "Наша команда",
            subtitle: "Сотрудники, которые делают смены особенными.",
        },
        gallery: {
            eyebrow: "Галерея",
            title: "Альбомы лагеря Новатор",
            subtitle: "Сохраняем яркие моменты с наших смен.",
        },
        shifts: {
            eyebrow: "Наши смены",
            title: "Доступные смены лагеря",
            subtitle: "Здесь отображаются смены, доступные для бронирования.",
        },
    },
};

export function mergeSiteContent(value = {}) {
    return {
        ...DEFAULT_SITE_CONTENT,
        ...value,
        aboutBlocks: Array.isArray(value.aboutBlocks) ? value.aboutBlocks : [],
        programs: Array.isArray(value.programs) ? value.programs : [],
        parentsSections: Array.isArray(value.parentsSections) ? value.parentsSections : [],
        documents: Array.isArray(value.documents) ? value.documents : [],
        menu: Array.isArray(value.menu) ? value.menu : [],
        shiftsHero: {
            ...DEFAULT_SITE_CONTENT.shiftsHero,
            ...(value.shiftsHero || {}),
        },
        schedule: {
            ...DEFAULT_SITE_CONTENT.schedule,
            ...(value.schedule || {}),
            items: Array.isArray(value.schedule?.items) ? value.schedule.items : [],
        },
        pageHeaders: {
            ...DEFAULT_SITE_CONTENT.pageHeaders,
            ...(value.pageHeaders || {}),
        },
    };
}
