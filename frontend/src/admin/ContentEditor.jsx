import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

const DEFAULT_HOME = {
    hero: {
        title: "",
        subtitle: "",
        description: "",
        cta: "",
        showRocket: true,
    },
    about: {
        title: "",
        text: "",
    },
    stats: [],
    itDirections: [],
    bookingForm: {
        title: "",
        subtitle: "",
        consentText: "",
    },
};

export default function ContentEditor() {
    const [data, setData] = useState(DEFAULT_HOME);
    const [initial, setInitial] = useState(DEFAULT_HOME);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let mounted = true;

        apiFetch("/api/content/home")
            .then((res) => {
                if (!mounted) return;
                const merged = mergeHome(res || {});
                setData(merged);
                setInitial(merged);
            })
            .catch((e) => {
                console.error(e);
                if (mounted) setError("Не удалось загрузить главную страницу");
            })
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    const changed = useMemo(() => JSON.stringify(data) !== JSON.stringify(initial), [data, initial]);

    const updateHero = (key, value) =>
        setData((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));

    const updateAbout = (key, value) =>
        setData((prev) => ({ ...prev, about: { ...prev.about, [key]: value } }));

    const updateStat = (index, key, value) => {
        setData((prev) => {
            const next = prev.stats.map((item, idx) =>
                idx === index ? { ...item, [key]: value } : item
            );
            return { ...prev, stats: next };
        });
    };

    const updateDirection = (index, key, value) => {
        setData((prev) => {
            const next = prev.itDirections.map((item, idx) =>
                idx === index ? { ...item, [key]: value } : item
            );
            return { ...prev, itDirections: next };
        });
    };

    const addStat = () =>
        setData((prev) => ({
            ...prev,
            stats: [...prev.stats, { label: "", value: "" }],
        }));

    const removeStat = (index) =>
        setData((prev) => ({
            ...prev,
            stats: prev.stats.filter((_, idx) => idx !== index),
        }));

    const updateBookingForm = (key, value) =>
        setData((prev) => ({ ...prev, bookingForm: { ...prev.bookingForm, [key]: value } }));

    const addDirection = () =>
        setData((prev) => ({
            ...prev,
            itDirections: [...prev.itDirections, { title: "", description: "" }],
        }));

    const removeDirection = (index) =>
        setData((prev) => ({
            ...prev,
            itDirections: prev.itDirections.filter((_, idx) => idx !== index),
        }));

    const save = async () => {
        if (!changed) return;
        if (!confirm("Точно сохранить изменения главной страницы?")) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = mergeHome(data);
            await apiFetch("/api/content/home", {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            setInitial(payload);
            setSuccess("Изменения сохранены");
            setTimeout(() => setSuccess(""), 2000);
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="bg-white rounded-2xl shadow p-6">Загрузка…</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">Главная страница</h1>
                    <p className="text-sm text-gray-500">
                        Изменение заголовков, программы и отображения ракеты.
                    </p>
                </div>

                <button
                    onClick={save}
                    disabled={!changed || saving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg disabled:opacity-50"
                >
                    {saving ? "Сохранение…" : "Сохранить"}
                </button>
            </div>

            {error && <Banner kind="error" text={error} />}
            {success && <Banner kind="success" text={success} />}

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Hero</h2>
                <Field label="Заголовок">
                    <input
                        className="input"
                        value={data.hero.title}
                        onChange={(e) => updateHero("title", e.target.value)}
                    />
                </Field>
                <Field label="Подзаголовок">
                    <input
                        className="input"
                        value={data.hero.subtitle}
                        onChange={(e) => updateHero("subtitle", e.target.value)}
                    />
                </Field>
                <Field label="Описание">
                    <textarea
                        className="input min-h-[90px]"
                        value={data.hero.description}
                        onChange={(e) => updateHero("description", e.target.value)}
                    />
                </Field>
                <Field label="Текст кнопки">
                    <input
                        className="input"
                        value={data.hero.cta}
                        onChange={(e) => updateHero("cta", e.target.value)}
                    />
                </Field>
                <label className="inline-flex items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={!!data.hero.showRocket}
                        onChange={(e) => updateHero("showRocket", e.target.checked)}
                    />
                    Показывать ракету на главной
                </label>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Анкета бронирования</h2>
                <Field label="Заголовок">
                    <input
                        className="input"
                        value={data.bookingForm.title}
                        onChange={(e) => updateBookingForm("title", e.target.value)}
                    />
                </Field>
                <Field label="Подзаголовок">
                    <input
                        className="input"
                        value={data.bookingForm.subtitle}
                        onChange={(e) => updateBookingForm("subtitle", e.target.value)}
                    />
                </Field>
                <Field label="Текст согласия">
                    <textarea
                        className="input min-h-[80px]"
                        value={data.bookingForm.consentText}
                        onChange={(e) => updateBookingForm("consentText", e.target.value)}
                    />
                </Field>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">О нас — текст</h2>
                <Field label="Заголовок">
                    <input
                        className="input"
                        value={data.about.title}
                        onChange={(e) => updateAbout("title", e.target.value)}
                        placeholder="Кто мы такие"
                    />
                </Field>
                <Field label="Текст">
                    <textarea
                        className="input min-h-[120px]"
                        value={data.about.text}
                        onChange={(e) => updateAbout("text", e.target.value)}
                        placeholder="Коротко о команде и миссии"
                    />
                </Field>
            </section>

            <section className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">О нас — плашки</h2>
                    <button
                        onClick={addStat}
                        className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
                    >
                        Добавить плашку
                    </button>
                </div>

                <div className="space-y-4">
                    {data.stats.map((stat, idx) => (
                        <div key={idx} className="rounded-2xl border p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-semibold">Элемент {idx + 1}</div>
                                <button
                                    onClick={() => removeStat(idx)}
                                    className="text-rose-600 text-sm"
                                >
                                    Удалить
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <Field label="Значение">
                                    <input
                                        className="input"
                                        value={stat.value}
                                        onChange={(e) => updateStat(idx, "value", e.target.value)}
                                        placeholder="Например, 300+"
                                    />
                                </Field>
                                <Field label="Подпись">
                                    <input
                                        className="input"
                                        value={stat.label}
                                        onChange={(e) => updateStat(idx, "label", e.target.value)}
                                        placeholder="Например, выпускников"
                                    />
                                </Field>
                            </div>
                        </div>
                    ))}
                    {data.stats.length === 0 && (
                        <div className="text-sm text-gray-500">Плашек пока нет.</div>
                    )}
                </div>
            </section>

            <section className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Программы (IT-направления)</h2>
                    <button
                        onClick={addDirection}
                        className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
                    >
                        Добавить
                    </button>
                </div>

                <div className="space-y-4">
                    {data.itDirections.map((dir, idx) => (
                        <div key={idx} className="rounded-2xl border p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-semibold">Программа {idx + 1}</div>
                                <button
                                    onClick={() => removeDirection(idx)}
                                    className="text-rose-600 text-sm"
                                >
                                    Удалить
                                </button>
                            </div>
                            <Field label="Название">
                                <input
                                    className="input"
                                    value={dir.title}
                                    onChange={(e) => updateDirection(idx, "title", e.target.value)}
                                />
                            </Field>
                            <Field label="Описание">
                                <textarea
                                    className="input min-h-[80px]"
                                    value={dir.description}
                                    onChange={(e) => updateDirection(idx, "description", e.target.value)}
                                />
                            </Field>
                        </div>
                    ))}
                    {data.itDirections.length === 0 && (
                        <div className="text-sm text-gray-500">Пока нет программ.</div>
                    )}
                </div>
            </section>

            <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 12px;
          padding: 10px 12px;
          outline: none;
        }
        .input:focus {
          border-color: rgba(59,130,246,0.7);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
      `}</style>
        </div>
    );
}

function mergeHome(value) {
    const hero = value.hero || {};
    const about = value.about || {};
    const experience = value.experience || {};
    const stats = Array.isArray(value.stats) ? value.stats : [];
    const itDirections = Array.isArray(value.itDirections) ? value.itDirections : [];
    const bookingForm = value.bookingForm || {};

    const aboutTitle = about.title || experience.title || "";
    const aboutText = about.text || experience.text || "";

    const mergedAbout = { title: aboutTitle, text: aboutText };

    return {
        hero: {
            title: hero.title || "",
            subtitle: hero.subtitle || "",
            description: hero.description || "",
            cta: hero.cta || "",
            showRocket: hero.showRocket !== false,
        },
        about: mergedAbout,
        experience: mergedAbout,
        stats,
        itDirections,
        bookingForm: {
            title: bookingForm.title || "",
            subtitle: bookingForm.subtitle || "",
            consentText: bookingForm.consentText || "",
        },
    };
}

function Field({ label, children }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-semibold">{label}</span>
            {children}
        </label>
    );
}

function Banner({ kind, text }) {
    const styles =
        kind === "error"
            ? "bg-red-50 text-red-700 border border-red-100"
            : "bg-green-50 text-green-700 border border-green-100";
    return <div className={`${styles} rounded-xl px-4 py-3`}>{text}</div>;
}
