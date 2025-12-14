import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

/**
 * CMS редактор контактов
 * URL API:
 *  GET  /api/content/contacts
 *  PUT  /api/content/contacts
 */

const DEFAULT_DATA = {
    title: "Контакты",
    phone: "",
    email: "",
    address: "",
    vkUrl: "",
    map: {
        lat: 54.7348,
        lng: 55.9579,
        zoom: 11
    }
};

export default function ContactsEditor() {
    const [data, setData] = useState(DEFAULT_DATA);
    const [initial, setInitial] = useState(DEFAULT_DATA);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    /* ================= LOAD ================= */
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await api.get("/api/content/contacts");
                const contacts = res?.data?.contacts || {};

                const merged = {
                    ...DEFAULT_DATA,
                    ...contacts,
                    map: {
                        ...DEFAULT_DATA.map,
                        ...(contacts.map || {})
                    }
                };

                if (!mounted) return;
                setData(merged);
                setInitial(merged);
            } catch (e) {
                console.error(e);
                if (mounted) setError("Не удалось загрузить контакты");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    /* ================= STATE ================= */
    const changed = useMemo(
        () => JSON.stringify(data) !== JSON.stringify(initial),
        [data, initial]
    );

    const update = (key, value) =>
        setData(prev => ({ ...prev, [key]: value }));

    const updateMap = (key, value) =>
        setData(prev => ({
            ...prev,
            map: { ...prev.map, [key]: value }
        }));

    /* ================= SAVE ================= */
    const save = async () => {
        if (!changed) return;
        if (!confirm("Точно сохранить изменения контактов?")) return;
        try {
            setSaving(true);
            setError("");
            setSuccess(false);

            await api.put("/api/content/contacts", data);

            setInitial(data);
            setSuccess(true);

            setTimeout(() => setSuccess(false), 2000);
        } catch (e) {
            console.error(e);
            setError("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="bg-white rounded-xl shadow p-6">
                    Загрузка...
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-extrabold">
                    Контакты
                </h1>
                <p className="text-sm text-gray-500">
                    Редактирование страницы контактов
                </p>
            </div>

            {/* FORM */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-5">

                <Field label="Заголовок">
                    <input
                        className="input"
                        value={data.title}
                        onChange={e => update("title", e.target.value)}
                    />
                </Field>

                <Field label="Телефон">
                    <input
                        className="input"
                        value={data.phone}
                        onChange={e => update("phone", e.target.value)}
                    />
                </Field>

                <Field label="Email">
                    <input
                        className="input"
                        value={data.email}
                        onChange={e => update("email", e.target.value)}
                    />
                </Field>

                <Field label="Адрес">
                    <textarea
                        className="input min-h-[80px]"
                        value={data.address}
                        onChange={e => update("address", e.target.value)}
                    />
                </Field>

                <Field label="VK ссылка">
                    <input
                        className="input"
                        value={data.vkUrl}
                        onChange={e => update("vkUrl", e.target.value)}
                    />
                </Field>

                <div className="grid grid-cols-3 gap-4">
                    <Field label="Широта (lat)">
                        <input
                            type="number"
                            step="any"
                            className="input"
                            value={data.map.lat}
                            onChange={e => updateMap("lat", Number(e.target.value))}
                        />
                    </Field>

                    <Field label="Долгота (lng)">
                        <input
                            type="number"
                            step="any"
                            className="input"
                            value={data.map.lng}
                            onChange={e => updateMap("lng", Number(e.target.value))}
                        />
                    </Field>

                    <Field label="Zoom">
                        <input
                            type="number"
                            className="input"
                            value={data.map.zoom}
                            onChange={e => updateMap("zoom", Number(e.target.value))}
                        />
                    </Field>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-4 pt-4">
                    <button
                        onClick={save}
                        disabled={!changed || saving}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
                    >
                        {saving ? "Сохранение..." : "Сохранить"}
                    </button>

                    {success && (
                        <span className="text-green-600 font-medium">
                            ✓ Сохранено
                        </span>
                    )}

                    {error && (
                        <span className="text-red-600 font-medium">
                            {error}
                        </span>
                    )}
                </div>
            </div>

            {/* MAP PREVIEW */}
            <div className="bg-white rounded-2xl shadow p-6">
                <div className="text-sm font-semibold mb-2">
                    Превью карты
                </div>

                <img
                    alt="map preview"
                    className="rounded-xl border"
                    src={`https://static-maps.yandex.ru/1.x/?ll=${data.map.lng},${data.map.lat}&z=${data.map.zoom}&l=map&size=650,350&pt=${data.map.lng},${data.map.lat},pm2blm`}
                />
            </div>

            {/* INLINE STYLES */}
            <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.15);
        }
      `}</style>
        </div>
    );
}

/* ====== UI ====== */

function Field({ label, children }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">
                {label}
            </span>
            {children}
        </label>
    );
}
