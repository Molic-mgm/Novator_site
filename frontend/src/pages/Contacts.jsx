import { useEffect, useMemo, useRef, useState } from "react";
import api from "../utils/api";

export default function Contacts() {
    const [content, setContent] = useState(null);
    const mapRef = useRef(null);
    const mapInited = useRef(false);

    const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const siteUrl = useMemo(
        () => import.meta.env.VITE_SITE_URL || runtimeOrigin || "",
        [runtimeOrigin]
    );
    const yandexApiKey = import.meta.env.VITE_YMAPS_KEY || "47af1c93-55ca-429b-b161-acf6ee1fb9de";

    useEffect(() => {
        api.get("/api/content/home").then(res => setContent(res.data.contacts));
    }, []);

    useEffect(() => {
        if (!content) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !mapInited.current) {
                    loadMap();
                    mapInited.current = true;
                }
            },
            { threshold: 0.3 }
        );

        if (mapRef.current) observer.observe(mapRef.current);
        return () => observer.disconnect();
    }, [content]);

    const loadMap = () => {
        if (window.ymaps) return initMap();

        const script = document.createElement("script");
        script.src =
            `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(yandexApiKey)}&lang=ru_RU`;
        script.onload = initMap;
        document.body.appendChild(script);
    };

    const initMap = () => {
        window.ymaps.ready(() => {
            const map = new window.ymaps.Map("yandex-map", {
                center: [content.map.lat, content.map.lng],
                zoom: content.map.zoom,
                controls: ["zoomControl"]
            });

            map.geoObjects.add(
                new window.ymaps.Placemark(
                    [content.map.lat, content.map.lng],
                    { balloonContent: "Детский IT лагерь «Новатор»" },
                    { preset: "islands#blueIcon" }
                )
            );
        });
    };

    if (!content) return null;

    return (
        <main className="bg-bg-light min-h-screen">

            {/* HERO */}
            <section className="bg-hero-gradient text-white py-20">
                <div className="container text-center animate-fadeUp">
                    <h1 className="text-4xl font-extrabold">{content.title}</h1>
                </div>
            </section>

            <section className="py-20">
                <div className="container grid lg:grid-cols-2 gap-12">

                    {/* INFO */}
                    <div className="space-y-8 animate-fadeUp">
                        <Card>
                            <Info label="Телефон">
                                <a href={`tel:${content.phone}`} className="text-brand-blue font-semibold">
                                    {content.phone}
                                </a>
                            </Info>

                            <Info label="Email">
                                <a href={`mailto:${content.email}`} className="hover:underline">
                                    {content.email}
                                </a>
                            </Info>

                            <Info label="Адрес">
                                {content.address}
                            </Info>

                            <a
                                href={content.vkUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 mt-6 text-brand-blue font-bold hover:underline"
                            >
                                VK → novatorcamp
                            </a>
                        </Card>
                    </div>

                    {/* MAP */}
                    <div ref={mapRef} className="opacity-0 animate-fadeUp">
                        <div className="bg-white rounded-card shadow-card overflow-hidden">
                            <div id="yandex-map" className="w-full h-[420px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* MICRODATA */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: "Детский IT лагерь «Новатор»",
                        url: siteUrl,
                        contactPoint: {
                            "@type": "ContactPoint",
                            telephone: content.phone,
                            contactType: "customer support"
                        },
                        address: {
                            "@type": "PostalAddress",
                            addressLocality: "Уфа",
                            addressRegion: "Республика Башкортостан",
                            streetAddress: content.address
                        },
                        sameAs: [content.vkUrl]
                    })
                }}
            />
        </main>
    );
}

/* ---------- UI ---------- */

function Card({ children }) {
    return (
        <div className="bg-white rounded-card shadow-soft p-8 space-y-4">
            {children}
        </div>
    );
}

function Info({ label, children }) {
    return (
        <div>
            <div className="text-sm text-text-muted">{label}</div>
            <div className="text-lg font-medium">{children}</div>
        </div>
    );
}
