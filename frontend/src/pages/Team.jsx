import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function Team() {
    const [members, setMembers] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        Promise.all([apiFetch("/api/team"), apiFetch("/api/content/site")])
            .then(([data, site]) => {
                if (!mounted) return;
                const visible = (data || [])
                    .filter((item) => item.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setMembers(visible);
                setHeader(site?.pageHeaders?.team || null);
            })
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    const handleVideoEnter = (event) => {
        const video = event.currentTarget;
        video.play().catch(() => {});
    };

    const handleVideoLeave = (event) => {
        const video = event.currentTarget;
        video.pause();
        video.currentTime = 0;
    };

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-6 animate-fade-up space-y-2">
                    <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                        {header?.eyebrow || "Команда"}
                    </div>
                    <h1 className="text-3xl font-extrabold">{header?.title || "Команда"}</h1>
                    {header?.subtitle && (
                        <p className="text-gray-600 max-w-2xl">{header.subtitle}</p>
                    )}
                </div>
                {loading ? (
                    <div>Загрузка…</div>
                ) : members.length === 0 ? (
                    <div className="text-slate-600">Команда появится здесь после добавления в админке.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {members.map((m) => (
                            <div key={m._id} className="card-surface p-5 space-y-3 hover-lift">
                                {m.photoUrl && (
                                    <div
                                        className="w-full rounded-xl mb-4 border bg-slate-50 overflow-hidden"
                                        style={{ aspectRatio: "3 / 4" }}
                                    >
                                        <img
                                            src={toAbsoluteUrl(m.photoUrl)}
                                            alt={m.name}
                                            className={`h-full w-full ${m.photoFit === "contain" ? "object-contain" : "object-cover"}`}
                                            style={{ objectPosition: m.photoPosition || "center center" }}
                                        />
                                    </div>
                                )}
                                <div className="text-xl font-bold">{m.name}</div>
                                {m.position && (
                                    <div className="text-sm text-blue-600 font-semibold mt-1">{m.position}</div>
                                )}
                                {m.description && (
                                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{m.description}</p>
                                )}
                                {m.longDescription && (
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{m.longDescription}</p>
                                )}
                                {m.videoUrl && (
                                    <video
                                        className="w-full rounded-xl border"
                                        muted
                                        playsInline
                                        preload="metadata"
                                        onMouseEnter={handleVideoEnter}
                                        onMouseLeave={handleVideoLeave}
                                        poster={m.videoPosterUrl ? toAbsoluteUrl(m.videoPosterUrl) : undefined}
                                    >
                                        <source src={toAbsoluteUrl(m.videoUrl)} />
                                    </video>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
