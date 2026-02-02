import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const EMPTY = {
    title: "",
    description: "",
    order: 0,
    isActive: true,
};

export default function VacanciesAdmin() {
    const [items, setItems] = useState([]);
    const [responses, setResponses] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        setSaved("");
        try {
            const [vacancies, responsesData] = await Promise.all([
                apiFetch("/api/vacancies/admin"),
                apiFetch("/api/vacancies/responses"),
            ]);
            setItems(vacancies || []);
            setResponses(responsesData || []);
        } catch (e) {
            setError(e.message || "Не удалось загрузить вакансии");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load().catch(() => {});
    }, []);

    const create = async () => {
        if (!form.title.trim()) return alert("Введите название вакансии");
        if (!confirm("Создать вакансию?")) return;
        setSaving(true);
        try {
            await apiFetch("/api/vacancies", {
                method: "POST",
                body: JSON.stringify(form),
            });
            setForm(EMPTY);
            setSaved("Вакансия добавлена");
            await load();
        } catch (e) {
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const updateVacancy = async (vacancy) => {
        if (!confirm("Сохранить изменения?")) return;
        setSaving(true);
        try {
            await apiFetch(`/api/vacancies/${vacancy._id}`, {
                method: "PATCH",
                body: JSON.stringify(vacancy),
            });
            setSaved("Изменения сохранены");
            await load();
        } catch (e) {
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!confirm("Удалить вакансию?")) return;
        setSaving(true);
        try {
            await apiFetch(`/api/vacancies/${id}`, { method: "DELETE" });
            setSaved("Вакансия удалена");
            await load();
        } catch (e) {
            setError(e.message || "Ошибка удаления");
        } finally {
            setSaving(false);
        }
    };

    const updateLocal = (id, key, value) => {
        setItems((prev) => prev.map((item) => (item._id === id ? { ...item, [key]: value } : item)));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold">Вакансии</h1>
                <p className="text-sm text-gray-500">Публикация вакансий и просмотр откликов.</p>
            </div>

            {error && <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
            {saved && !error && (
                <div className="bg-green-50 text-green-800 border border-green-100 rounded-xl px-4 py-3">✓ {saved}</div>
            )}

            <section className="card p-6 space-y-4">
                <div className="font-bold">Добавить вакансию</div>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        className="input"
                        placeholder="Название"
                        value={form.title}
                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <input
                        className="input"
                        type="number"
                        placeholder="Порядок"
                        value={form.order}
                        onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    />
                    <textarea
                        className="input min-h-[80px] md:col-span-2"
                        placeholder="Описание"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <label className="inline-flex items-center gap-2 text-sm font-medium md:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        />
                        Публиковать вакансию
                    </label>
                </div>
                <button
                    onClick={create}
                    disabled={saving}
                    className="px-5 py-2 rounded-2xl font-extrabold text-white bg-novator-blue disabled:opacity-60"
                >
                    {saving ? "Сохранение…" : "Сохранить"}
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <div className="font-bold">Список вакансий</div>
                {loading ? (
                    <div>Загрузка…</div>
                ) : items.length === 0 ? (
                    <div className="text-sm text-slate-600">Вакансий пока нет.</div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item._id} className="rounded-2xl border p-4 space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input
                                        className="input"
                                        value={item.title || ""}
                                        onChange={(e) => updateLocal(item._id, "title", e.target.value)}
                                    />
                                    <input
                                        className="input"
                                        type="number"
                                        value={item.order || 0}
                                        onChange={(e) => updateLocal(item._id, "order", Number(e.target.value))}
                                    />
                                    <textarea
                                        className="input min-h-[80px] md:col-span-2"
                                        value={item.description || ""}
                                        onChange={(e) => updateLocal(item._id, "description", e.target.value)}
                                    />
                                    <label className="inline-flex items-center gap-2 text-sm font-medium md:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive !== false}
                                            onChange={(e) => updateLocal(item._id, "isActive", e.target.checked)}
                                        />
                                        Показывать на сайте
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateVacancy(item)}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold disabled:opacity-60"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => remove(item._id)}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold disabled:opacity-60"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="card p-6 space-y-4">
                <div className="font-bold">Отклики</div>
                {responses.length === 0 ? (
                    <div className="text-sm text-slate-600">Откликов пока нет.</div>
                ) : (
                    <div className="space-y-3">
                        {responses.map((response) => (
                            <div key={response._id} className="rounded-2xl border p-4">
                                <div className="text-xs uppercase text-slate-500">Вакансия</div>
                                <div className="font-bold">{response.vacancy?.title || "—"}</div>
                                <div className="mt-2 text-sm text-slate-700">
                                    {response.fullName} · {response.email} · {response.phone}
                                </div>
                                {response.message && (
                                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{response.message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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
