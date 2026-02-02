import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { mergeSiteContent } from "../utils/siteContent";
import { toAbsoluteUrl } from "../utils/media";

function SectionList({ title, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-4">
            <div className="text-sm font-bold text-slate-600">{title}</div>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                {items.map((item, idx) => (
                    <li key={`${title}-${idx}`}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default function Parents() {
    const [sections, setSections] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        apiFetch("/api/content/site")
            .then((data) => {
                if (!active) return;
                const site = mergeSiteContent(data || {});
                const sorted = (site.parentsSections || [])
                    .filter((section) => section.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setSections(sorted);
                setHeader(site.pageHeaders?.parents || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить данные"))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-10">
            <div className="text-center animate-fade-up">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                    {header?.eyebrow || "Родителям"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
                    {header?.title || "Полезная информация"}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    {header?.subtitle || "Документы, правила и требования для родителей и детей."}
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="space-y-8">
                    {sections.map((section) => (
                        <section key={section._id || section.slug} className="card-surface p-6 hover-lift">
                            <div className="flex flex-col md:flex-row gap-4">
                                {section.imageUrl ? (
                                    <img
                                        src={toAbsoluteUrl(section.imageUrl)}
                                        alt={section.title}
                                        className="w-full md:w-48 h-32 object-cover rounded-2xl"
                                    />
                                ) : null}
                                <div>
                                    <h2 className="text-2xl font-extrabold">{section.title}</h2>
                                    {section.body && (
                                        <p className="text-gray-700 mt-3 whitespace-pre-line">{section.body}</p>
                                    )}
                                </div>
                            </div>

                            <SectionList title="Список" items={section.listItems || []} />
                            <SectionList title="Можно" items={section.listGroups?.allowed || []} />
                            <SectionList title="Нельзя" items={section.listGroups?.disallowed || []} />
                            <SectionList title="По согласованию" items={section.listGroups?.conditional || []} />

                            {section.files && section.files.length > 0 && (
                                <div className="mt-5 space-y-2">
                                    <div className="text-sm font-bold text-slate-600">Файлы</div>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {section.files.map((file, idx) => (
                                            <a
                                                key={`${section.slug}-file-${idx}`}
                                                href={toAbsoluteUrl(file.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 hover:bg-slate-50"
                                            >
                                                <span className="font-semibold text-slate-700">{file.title || "Файл"}</span>
                                                <span className="text-sm text-blue-600">Скачать</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    ))}

                    {sections.length === 0 && (
                        <div className="text-center text-gray-600">Раздел пока не заполнен.</div>
                    )}
                </div>
            )}
        </div>
    );
}
