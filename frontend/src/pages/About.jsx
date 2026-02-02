import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { mergeSiteContent } from "../utils/siteContent";
import { toAbsoluteUrl } from "../utils/media";

export default function About() {
    const [blocks, setBlocks] = useState([]);
    const [header, setHeader] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        apiFetch("/api/content/site")
            .then((data) => {
                if (!active) return;
                const site = mergeSiteContent(data || {});
                const sorted = (site.aboutBlocks || [])
                    .filter((block) => block.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setBlocks(sorted);
                setHeader(site.pageHeaders?.about || null);
                setSchedule(site.schedule || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить данные"))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-10">
            <div className="text-center animate-fade-up">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                    {header?.eyebrow || "О лагере"}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-3">
                    {header?.title || "Жизнь в «Новаторе»"}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    {header?.subtitle || "Узнайте больше о безопасности, питании и распорядке дня."}
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="space-y-10">
                    {(() => {
                        const groups = blocks.reduce((acc, block) => {
                            const groupTitle = (block.group || "").trim() || "Общая информация";
                            if (!acc[groupTitle]) {
                                acc[groupTitle] = { title: groupTitle, order: block.groupOrder || 0, items: [] };
                            }
                            acc[groupTitle].items.push(block);
                            acc[groupTitle].order = Math.min(acc[groupTitle].order, block.groupOrder || 0);
                            return acc;
                        }, {});

                        const groupList = Object.values(groups).sort((a, b) => {
                            if (a.order === b.order) return a.title.localeCompare(b.title);
                            return a.order - b.order;
                        });

                        if (groupList.length === 0) {
                            return <div className="text-center text-gray-600">Раздел пока не заполнен.</div>;
                        }

                        return groupList.map((group) => (
                            <section key={group.title} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
                                        {group.title.slice(0, 1).toUpperCase()}
                                    </div>
                                    <h2 className="text-2xl font-extrabold">{group.title}</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {group.items
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map((block) => (
                                            <div
                                                key={block._id || block.title}
                                                className="card-surface p-5 hover-lift flex gap-4"
                                            >
                                                {block.imageUrl ? (
                                                    <img
                                                        src={toAbsoluteUrl(block.imageUrl)}
                                                        alt={block.title}
                                                        className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                                                        Нет фото
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-bold">{block.title}</h3>
                                                    {block.text && (
                                                        <p className="text-sm text-gray-700 whitespace-pre-line">{block.text}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>
                        ));
                    })()}

                    {schedule && (schedule.items || []).length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center">
                                    ⏰
                                </div>
                                <h2 className="text-2xl font-extrabold">{schedule.title || "Распорядок дня"}</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {schedule.items.map((item, index) => (
                                    <div key={`${item[0]}-${index}`} className="card-surface p-4 flex items-center gap-4">
                                        <div className="text-blue-600 font-extrabold min-w-[72px]">{item[0]}</div>
                                        <div className="text-gray-700 text-sm">{item[1]}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
