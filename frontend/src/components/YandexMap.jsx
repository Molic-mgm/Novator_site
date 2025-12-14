import React, { useEffect, useRef } from "react";

const KEY = import.meta.env.VITE_YMAPS_KEY;

export default function YandexMap({ lat = 54.7348, lon = 55.9577, zoom = 9 }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!KEY) return;

        const id = "ymaps2-script";
        const load = () =>
            new Promise((resolve, reject) => {
                if (window.ymaps) return resolve();
                const existing = document.getElementById(id);
                if (existing) return resolve();

                const s = document.createElement("script");
                s.id = id;
                s.src = `https://api-maps.yandex.ru/2.1/?apikey=${KEY}&lang=ru_RU`;
                s.async = true;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

        let map;

        (async () => {
            try {
                await load();
                window.ymaps.ready(() => {
                    if (!ref.current) return;

                    map = new window.ymaps.Map(ref.current, {
                        center: [lon, lat],
                        zoom,
                        controls: ["zoomControl"],
                    });

                    const placemark = new window.ymaps.Placemark(
                        [lon, lat],
                        {},
                        { preset: "islands#blueIcon" }
                    );

                    map.geoObjects.add(placemark);
                });
            } catch (e) {
                console.error(e);
            }
        })();

        return () => {
            try {
                map?.destroy?.();
            } catch { }
        };
    }, [lat, lon, zoom]);

    if (!KEY) {
        return (
            <div className="h-[420px] w-full bg-slate-200 flex items-center justify-center text-slate-600">
                Нет VITE_YMAPS_KEY
            </div>
        );
    }

    return <div ref={ref} className="h-[420px] w-full" />;
}
