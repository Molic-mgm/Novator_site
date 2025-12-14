import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function Shifts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/shifts");
                setItems(data);
            } catch (e) {
                setError(e.message || "Не удалось загрузить смены");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">Наши смены</div>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3">Доступные смены лагеря</h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    Здесь отображаются смены, которые можно выбрать в форме бронирования.
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="grid md:grid-cols-2 gap-5">
                    {items.map(item => (
                        <div key={item._id} className="border rounded-3xl p-6 shadow-sm bg-white space-y-3">
                            <div className="text-xs uppercase text-blue-600 font-bold">Смена</div>
                            <div className="text-xl font-extrabold mt-1">{item.title}</div>
                            {item.dates && <div className="text-sm text-gray-600 mt-1">{item.dates}</div>}
                            {item.price && <div className="text-sm text-gray-800">Стоимость: {item.price}</div>}
                            {item.imageUrl && (
                                    <img
                                        src={toAbsoluteUrl(item.imageUrl)}
                                        alt={item.title}
                                        className={`w-full rounded-2xl max-h-60 border bg-slate-50 ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                                        style={{ objectPosition: item.imagePosition || "center center" }}
                                    />
                            )}
                            {item.description && <p className="text-gray-700">{item.description}</p>}
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="col-span-2 text-center text-gray-600">Смены пока не добавлены.</div>
                    )}
                </div>
            )}
        </div>
    );
}
