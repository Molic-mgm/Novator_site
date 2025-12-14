import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function HeroEditor() {
    const [hero, setHero] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        apiFetch("/api/content/home").then((data) => setHero(data.hero));
    }, []);

    if (!hero) return <div>Загрузка…</div>;

    const save = async () => {
        setSaving(true);
        await apiFetch("/api/content/home", {
            method: "PUT",
            body: JSON.stringify({ hero })
        });
        setSaving(false);
        alert("Hero сохранён");
    };

    return (
        <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold">Hero (главный экран)</h2>

            <Field
                label="Заголовок"
                value={hero.title}
                onChange={(v) => setHero({ ...hero, title: v })}
            />
            <Field
                label="Подзаголовок"
                value={hero.subtitle}
                onChange={(v) => setHero({ ...hero, subtitle: v })}
            />
            <Field
                label="Описание"
                textarea
                value={hero.description}
                onChange={(v) => setHero({ ...hero, description: v })}
            />
            <Field
                label="Текст кнопки"
                value={hero.cta}
                onChange={(v) => setHero({ ...hero, cta: v })}
            />

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={hero.showRocket}
                    onChange={(e) =>
                        setHero({ ...hero, showRocket: e.target.checked })
                    }
                />
                Показывать ракету
            </label>

            <button
                onClick={save}
                disabled={saving}
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold"
            >
                {saving ? "Сохранение..." : "Сохранить"}
            </button>
        </div>
    );
}

function Field({ label, value, onChange, textarea }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <label className="block">
            <div className="mb-1 font-medium">{label}</div>
            <Tag
                className="w-full rounded border px-3 py-2"
                value={value}
                rows={3}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );
}
