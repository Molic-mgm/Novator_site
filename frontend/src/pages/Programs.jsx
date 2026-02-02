import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { mergeSiteContent } from "../utils/siteContent";
import { toAbsoluteUrl } from "../utils/media";

export default function Programs() {
    const [programs, setPrograms] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        apiFetch("/api/content/site")
            .then((data) => {
                if (!active) return;
                const site = mergeSiteContent(data || {});
                const sorted = (site.programs || [])
                    .filter((program) => program.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setPrograms(sorted);
                setHeader(site.pageHeaders?.programs || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить программы"))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 space-y-10">
            <div className="text-center animate-fade-up">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                    {header?.eyebrow || "Программы"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
                    {header?.title || "Направления лагеря"}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    {header?.subtitle || "Четыре основных программы с возможностью добавлять направления."}
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="space-y-10">
                    {programs.map((program) => (
                        <section key={program._id || program.key} className="card-surface p-6 hover-lift">
                            <h2 className="text-2xl font-extrabold">{program.title}</h2>
                            {program.description && (
                                <p className="text-gray-700 mt-3 whitespace-pre-line">{program.description}</p>
                            )}
                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                                {(program.directions || [])
                                    .filter((direction) => direction.isActive !== false)
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((direction) => (
                                        <div key={direction._id || direction.title} className="border rounded-2xl p-4 hover-lift">
                                            {direction.imageUrl ? (
                                                <img
                                                    src={toAbsoluteUrl(direction.imageUrl)}
                                                    alt={direction.title}
                                                    className="w-full h-40 object-cover rounded-xl mb-3"
                                                />
                                            ) : (
                                                <div className="w-full h-40 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                                                    Фото не добавлено
                                                </div>
                                            )}
                                            <div className="font-bold text-lg">{direction.title}</div>
                                            {direction.description && (
                                                <p className="text-gray-600 mt-2 whitespace-pre-line">{direction.description}</p>
                                            )}
                                        </div>
                                    ))}
                                {(program.directions || []).length === 0 && (
                                    <div className="text-gray-500">Направления пока не добавлены.</div>
                                )}
                            </div>
                        </section>
                    ))}

                    {programs.length === 0 && (
                        <div className="text-center text-gray-600">Программы пока не добавлены.</div>
                    )}
                </div>
            )}
        </div>
    );
}
