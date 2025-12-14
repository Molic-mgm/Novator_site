import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroRocket from "../assets/hero-rocket.png";
import { apiFetch } from "../utils/api";

export default function Home() {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        apiFetch("/api/content/home")
            .then((data) => {
                if (mounted) {
                    setContent(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <span className="text-gray-400">Загрузка…</span>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <span className="text-red-400">Контент недоступен</span>
            </div>
        );
    }

    const {
        hero,
        about,
        experience,
        stats = [],
        itDirections = [],
    } = content;

    const aboutTitle = about?.title || experience?.title;
    const primaryText = about?.text || experience?.text;

    const showRocket = hero?.showRocket !== false;

    return (
        <main className="bg-white text-gray-900">

            {/* ================= HERO ================= */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-400" />

                {/* Dots */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
                        backgroundSize: "26px 26px",
                    }}
                />

                <div className="relative z-10 max-w-4xl px-4 text-center text-white">

                    {/* Rocket */}
                    {showRocket && (
                        <img
                            src={heroRocket}
                            alt="Ракета"
                            className="mx-auto mb-12 w-28 md:w-36 animate-[float_6s_ease-in-out_infinite]"
                            draggable={false}
                        />
                    )}

                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        {hero?.title}
                    </h1>

                    {hero?.subtitle && (
                        <p className="text-lg md:text-xl opacity-90 mb-10">
                            {hero.subtitle}
                        </p>
                    )}

                    <button
                        onClick={() => navigate("/booking")}
                        className="inline-flex items-center justify-center rounded-full bg-white text-blue-600 px-10 py-4 text-lg font-bold hover:scale-105 transition"
                    >
                        {hero?.cta || "Забронировать"}
                    </button>
                </div>
            </section>

            {(aboutTitle || primaryText || stats.length > 0) && (
                <section className="py-24 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 space-y-10">
                        <div className="space-y-5 text-center">
                            {aboutTitle && (
                                <h2 className="text-3xl font-bold text-center">{aboutTitle}</h2>
                            )}
                            {primaryText && (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-center">
                                    {primaryText}
                                </p>
                            )}
                        </div>
                        {stats.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((s) => (
                                    <div
                                        key={s._id}
                                        className="border rounded-2xl p-5 shadow-md bg-white"
                                    >
                                        <div className="text-2xl font-extrabold text-blue-600">{s.value}</div>
                                        <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ================= IT DIRECTIONS ================= */}
            {itDirections.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            IT-направления
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {itDirections.map((it) => (
                                <div
                                    key={it._id}
                                    className="rounded-3xl border p-8 hover:shadow-xl transition"
                                >
                                    <h3 className="text-xl font-bold mb-4">
                                        {it.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {it.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
