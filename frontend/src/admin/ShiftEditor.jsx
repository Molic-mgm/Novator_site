import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function ShiftEditor() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ title: "", dates: "", price: "", description: "", imageUrl: "", imageFit: "cover", imagePosition: "center center" });
    const [formFile, setFormFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState("");

    const load = async () => setItems(await apiFetch("/api/shifts"));
    useEffect(() => { load().catch(e => alert(e.message)); }, []);

    const create = async () => {
        if (!confirm("Создать/обновить список смен с новыми данными?")) return;
        setSaving(true);
        setError("");
        setSaved("");
        try {
            const created = await apiFetch("/api/shifts", { method: "POST", body: JSON.stringify(form) });
            if (formFile) {
                const fd = new FormData();
                fd.append("image", formFile);
                fd.append("imageFit", form.imageFit);
                fd.append("imagePosition", form.imagePosition);
                await apiFetch(`/api/shifts/${created._id}/image`, { method: "POST", body: fd });
            }
            setForm({ title: "", dates: "", price: "", description: "", imageUrl: "", imageFit: "cover", imagePosition: "center center" });
            setFormFile(null);
            setSaved("Новая смена сохранена");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Не удалось сохранить смену");
        } finally {
            setSaving(false);
        }
    };

    const updateShift = async (shift) => {
        setSaving(true);
        setError("");
        setSaved("");
        try {
            await apiFetch(`/api/shifts/${shift._id}`, { method: "PATCH", body: JSON.stringify({
                title: shift.title,
                dates: shift.dates,
                price: shift.price,
                description: shift.description,
                imageUrl: shift.imageUrl,
                imageFit: shift.imageFit,
                imagePosition: shift.imagePosition,
            }) });
            setSaved("Изменения сохранены");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    };

    const uploadImage = async (id, file, meta) => {
        if (!file) return;
        setSaving(true);
        setError("");
        setSaved("");
        try {
            const fd = new FormData();
            fd.append("image", file);
            if (meta?.imageFit) fd.append("imageFit", meta.imageFit);
            if (meta?.imagePosition) fd.append("imagePosition", meta.imagePosition);
            await apiFetch(`/api/shifts/${id}/image`, { method: "POST", body: fd });
            setSaved("Фото обновлено");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Не удалось обновить фото");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!confirm("Удалить смену?")) return;
        setSaving(true);
        setError("");
        setSaved("");
        try {
            await apiFetch(`/api/shifts/${id}`, { method: "DELETE" });
            setSaved("Смена удалена");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Не удалось удалить смену");
        } finally {
            setSaving(false);
        }
    };

    const updateLocal = (id, key, value) => {
        setItems(prev => prev.map((s) => s._id === id ? { ...s, [key]: value } : s));
    };

    return (
        <div>
            <div className="text-2xl font-extrabold">Смены</div>
            <div className="text-sm text-slate-600 mt-1">Создание, редактирование и загрузка фотографий смен.</div>

            {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            <div className="card p-6 mt-6">
                <div className="font-extrabold">Добавить смену</div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <input className="px-3 py-2 rounded-2xl border" placeholder="Название"
                        value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    <input className="px-3 py-2 rounded-2xl border" placeholder="Даты (текст)"
                        value={form.dates} onChange={e => setForm(f => ({ ...f, dates: e.target.value }))} />
                    <input className="px-3 py-2 rounded-2xl border" placeholder="Цена (текст)"
                        value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    <input className="px-3 py-2 rounded-2xl border" placeholder="Описание (кратко)"
                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    <input className="px-3 py-2 rounded-2xl border" placeholder="Фото (URL)"
                        value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Как показывать фото</div>
                        <select
                            className="mt-2 px-3 py-2 rounded-2xl border w-full"
                            value={form.imageFit}
                            onChange={(e) => setForm((f) => ({ ...f, imageFit: e.target.value }))}
                        >
                            <option value="cover">Обрезать под карточку (cover)</option>
                            <option value="contain">Вписать без обрезки (contain)</option>
                        </select>
                    </label>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Фокус фото</div>
                        <select
                            className="mt-2 px-3 py-2 rounded-2xl border w-full"
                            value={form.imagePosition}
                            onChange={(e) => setForm((f) => ({ ...f, imagePosition: e.target.value }))}
                        >
                            <option value="center center">По центру</option>
                            <option value="top center">Верх</option>
                            <option value="bottom center">Низ</option>
                            <option value="center left">Слева</option>
                            <option value="center right">Справа</option>
                        </select>
                    </label>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Или загрузите файл</div>
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-2"
                            onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <button
                        onClick={create}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-2xl font-extrabold text-white bg-novator-blue disabled:opacity-60"
                    >
                        {saving ? "Сохранение..." : "Сохранить смену"}
                    </button>
                    {saved && <span className="text-sm text-green-700">✓ {saved}</span>}
                </div>
            </div>

            <div className="card p-6 mt-6">
                <div className="font-extrabold mb-3">Список смен</div>
                <div className="space-y-3">
                    {items.map(s => (
                        <div key={s._id} className="border rounded-3xl p-4 space-y-3">
                            <div className="grid md:grid-cols-2 gap-3 items-start">
                                <div className="space-y-2">
                                    <input className="px-3 py-2 rounded-2xl border w-full" value={s.title} onChange={(e) => updateLocal(s._id, "title", e.target.value)} />
                                    <input className="px-3 py-2 rounded-2xl border w-full" value={s.dates} onChange={(e) => updateLocal(s._id, "dates", e.target.value)} />
                                    <input className="px-3 py-2 rounded-2xl border w-full" value={s.price} onChange={(e) => updateLocal(s._id, "price", e.target.value)} />
                                    <input className="px-3 py-2 rounded-2xl border w-full" value={s.description || ""} onChange={(e) => updateLocal(s._id, "description", e.target.value)} />
                                    <input className="px-3 py-2 rounded-2xl border w-full" value={s.imageUrl || ""} onChange={(e) => updateLocal(s._id, "imageUrl", e.target.value)} placeholder="Фото (URL)" />
                                    <label className="block">
                                        <div className="text-xs font-bold text-slate-600">Как показывать фото</div>
                                        <select
                                            className="mt-2 px-3 py-2 rounded-2xl border w-full"
                                            value={s.imageFit || "cover"}
                                            onChange={(e) => updateLocal(s._id, "imageFit", e.target.value)}
                                        >
                                            <option value="cover">Обрезать под карточку (cover)</option>
                                            <option value="contain">Вписать без обрезки (contain)</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <div className="text-xs font-bold text-slate-600">Фокус фото</div>
                                        <select
                                            className="mt-2 px-3 py-2 rounded-2xl border w-full"
                                            value={s.imagePosition || "center center"}
                                            onChange={(e) => updateLocal(s._id, "imagePosition", e.target.value)}
                                        >
                                            <option value="center center">По центру</option>
                                            <option value="top center">Верх</option>
                                            <option value="bottom center">Низ</option>
                                            <option value="center left">Слева</option>
                                            <option value="center right">Справа</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    {s.imageUrl && (
                                        <img
                                            src={toAbsoluteUrl(s.imageUrl)}
                                            alt={s.title}
                                            className={`w-full max-w-xs rounded-xl border bg-slate-50 ${s.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                                            style={{ objectPosition: s.imagePosition || "center center" }}
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => uploadImage(s._id, e.target.files?.[0], s)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={() => updateShift(s)}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-2xl bg-brand-blue text-white font-extrabold disabled:opacity-60"
                                >
                                    {saving ? "Сохранение..." : "Сохранить"}
                                </button>
                                <button
                                    onClick={() => remove(s._id)}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-2xl bg-rose-600 text-white font-extrabold disabled:opacity-60"
                                >
                                    Удалить
                                </button>
                                {saved && <span className="text-sm text-green-700">✓ {saved}</span>}
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <div className="text-slate-600">Смен пока нет.</div>}
                </div>
            </div>
        </div>
    );
}
