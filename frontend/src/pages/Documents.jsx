import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { mergeSiteContent } from "../utils/siteContent";
import { toAbsoluteUrl } from "../utils/media";

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        apiFetch("/api/content/site")
            .then((data) => {
                if (!active) return;
                const site = mergeSiteContent(data || {});
                const sorted = (site.documents || [])
                    .filter((doc) => doc.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setDocuments(sorted);
                setHeader(site.pageHeaders?.documents || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить документы"))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-8">
            <div className="text-center animate-fade-up">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                    {header?.eyebrow || "Документы"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
                    {header?.title || "Официальные документы"}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    {header?.subtitle || "Лицензии, сертификаты и другие документы лагеря."}
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div key={doc._id || doc.title} className="card-surface p-5 hover-lift">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex gap-4 items-start">
                                    {doc.imageUrl && (
                                        <img
                                            src={toAbsoluteUrl(doc.imageUrl)}
                                            alt={doc.title}
                                            className="w-24 h-24 rounded-2xl object-cover"
                                        />
                                    )}
                                    <div>
                                        <div className="text-lg font-extrabold">{doc.title}</div>
                                        {doc.date && <div className="text-sm text-slate-500 mt-1">{doc.date}</div>}
                                        {doc.description && (
                                            <div className="text-gray-700 mt-2 whitespace-pre-line">{doc.description}</div>
                                        )}
                                    </div>
                                </div>
                                {doc.fileUrl && (
                                    <a
                                        href={toAbsoluteUrl(doc.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 text-center"
                                    >
                                        Скачать
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <div className="text-center text-gray-600">Документы пока не добавлены.</div>
                    )}
                </div>
            )}
        </div>
    );
}
