import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

const EMPTY = {
    title: "",
    description: "",
    cover: null,
    coverFit: "contain",
    coverPosition: "center center",
};

export default function GalleryAdmin() {
    const [albums, setAlbums] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const replaceAlbum = (updated) => {
        setAlbums((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    };

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch("/api/gallery");
            setAlbums(data || []);
        } catch (e) {
            setError(e.message || "Ошибка загрузки галереи");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load().catch(() => {});
    }, []);

    const createAlbum = async () => {
        if (!form.title.trim()) return alert("Введите название альбома");
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("description", form.description);
            fd.append("coverFit", form.coverFit);
            fd.append("coverPosition", form.coverPosition);
            if (form.cover) fd.append("cover", form.cover);
            await apiFetch("/api/gallery", { method: "POST", body: fd });
            setForm(EMPTY);
            await load();
        } catch (e) {
            alert(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const updateAlbum = async (album, coverFile) => {
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", album.title || "");
            fd.append("description", album.description || "");
            if (coverFile) fd.append("cover", coverFile);
            fd.append("coverFit", album.coverFit || "contain");
            fd.append("coverPosition", album.coverPosition || "center center");
            const updated = await apiFetch(`/api/gallery/${album._id}`, { method: "PATCH", body: fd });
            replaceAlbum(updated);
        } catch (e) {
            alert(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const deleteAlbum = async (id) => {
        if (!confirm("Удалить альбом?")) return;
        setSaving(true);
        try {
            await apiFetch(`/api/gallery/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            alert(e.message || "Ошибка удаления");
        } finally {
            setSaving(false);
        }
    };

    const uploadPhotos = async (id, files) => {
        if (!files || files.length === 0) return;
        setSaving(true);
        try {
            const fd = new FormData();
            Array.from(files).forEach((file) => fd.append("photos", file));
            const updated = await apiFetch(`/api/gallery/${id}/photos`, { method: "POST", body: fd });
            replaceAlbum(updated);
        } catch (e) {
            alert(e.message || "Ошибка загрузки фотографий");
        } finally {
            setSaving(false);
        }
    };

    const updateLocal = (id, key, value) => {
        setAlbums((prev) => prev.map((a) => (a._id === id ? { ...a, [key]: value } : a)));
    };

    const removePhoto = async (albumId, photoUrl) => {
        if (!confirm("Удалить фото?")) return;
        setSaving(true);
        try {
            const updated = await apiFetch(`/api/gallery/${albumId}/photos`, {
                method: "DELETE",
                body: { photoUrl },
            });
            replaceAlbum(updated);
        } catch (e) {
            alert(e.message || "Ошибка удаления фото");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold">Галерея</h1>
                <p className="text-sm text-gray-500">Создайте альбом, загрузите обложку и фотографии.</p>
            </div>

            {error && <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl px-4 py-3">{error}</div>}

            <section className="card p-6 space-y-4">
                <div className="font-bold">Создать альбом</div>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        className="input"
                        placeholder="Название"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Описание"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                    <div>
                        <label className="text-xs font-bold text-slate-600">Обложка</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="input mt-1"
                            onChange={(e) => setForm((f) => ({ ...f, cover: e.target.files?.[0] || null }))}
                        />
                    </div>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Отображение обложки</div>
                        <select
                            className="input mt-1"
                            value={form.coverFit}
                            onChange={(e) => setForm((f) => ({ ...f, coverFit: e.target.value }))}
                        >
                            <option value="contain">Без обрезки (contain)</option>
                            <option value="cover">Заполнить карточку (cover)</option>
                        </select>
                    </label>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Фокус обложки</div>
                        <select
                            className="input mt-1"
                            value={form.coverPosition}
                            onChange={(e) => setForm((f) => ({ ...f, coverPosition: e.target.value }))}
                        >
                            <option value="center center">По центру</option>
                            <option value="top center">Верх</option>
                            <option value="bottom center">Низ</option>
                            <option value="center left">Слева</option>
                            <option value="center right">Справа</option>
                        </select>
                    </label>
                </div>
                <button
                    onClick={createAlbum}
                    disabled={saving}
                    className="px-5 py-2 rounded-2xl font-extrabold text-white bg-novator-blue disabled:opacity-60"
                >
                    {saving ? "Сохранение…" : "Сохранить альбом"}
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <div className="font-bold">Альбомы</div>
                {loading ? (
                    <div>Загрузка…</div>
                ) : albums.length === 0 ? (
                    <div className="text-sm text-slate-600">Пока нет альбомов.</div>
                ) : (
                    <div className="space-y-4">
                        {albums.map((album) => (
                            <div key={album._id} className="border rounded-2xl p-4 space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input
                                        className="input"
                                        value={album.title || ""}
                                        onChange={(e) => updateLocal(album._id, "title", e.target.value)}
                                        placeholder="Название"
                                    />
                                    <input
                                        className="input"
                                        value={album.description || ""}
                                        onChange={(e) => updateLocal(album._id, "description", e.target.value)}
                                        placeholder="Описание"
                                    />
                                    <label className="block">
                                        <div className="text-xs font-bold text-slate-600">Отображение обложки</div>
                                        <select
                                            className="input mt-1"
                                            value={album.coverFit || "contain"}
                                            onChange={(e) => updateLocal(album._id, "coverFit", e.target.value)}
                                        >
                                            <option value="contain">Без обрезки (contain)</option>
                                            <option value="cover">Заполнить карточку (cover)</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <div className="text-xs font-bold text-slate-600">Фокус обложки</div>
                                        <select
                                            className="input mt-1"
                                            value={album.coverPosition || "center center"}
                                            onChange={(e) => updateLocal(album._id, "coverPosition", e.target.value)}
                                        >
                                            <option value="center center">По центру</option>
                                            <option value="top center">Верх</option>
                                            <option value="bottom center">Низ</option>
                                            <option value="center left">Слева</option>
                                            <option value="center right">Справа</option>
                                        </select>
                                    </label>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-600">Обложка</div>
                                        {album.coverUrl && (
                                            <img
                                                src={toAbsoluteUrl(album.coverUrl)}
                                                alt={album.title}
                                                className={`w-full max-w-xs rounded-xl border bg-slate-50 ${album.coverFit === "cover" ? "object-cover" : "object-contain"}`}
                                                style={{ objectPosition: album.coverPosition || "center center" }}
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="input"
                                            onChange={(e) => updateAlbum(album, e.target.files?.[0])}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-600">Добавить фото</div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="input"
                                            onChange={(e) => uploadPhotos(album._id, e.target.files)}
                                        />
                                        <div className="text-xs text-slate-600">В альбоме {album.photos?.length || 0} фото.</div>
                                    </div>
                                </div>

                                {!!album.photos?.length && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-600">Фотографии альбома</div>
                                        <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {album.photos.map((photo, idx) => (
                                                <div key={`${photo}-${idx}`} className="relative group">
                                                    <div className="overflow-hidden rounded-xl border bg-slate-50 aspect-[4/3]">
                                                        <img
                                                            src={toAbsoluteUrl(photo)}
                                                            alt={`Фото ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(album._id, photo)}
                                                        disabled={saving}
                                                        className="mt-1 w-full text-xs font-bold text-rose-600 border border-rose-100 rounded-lg py-1 hover:bg-rose-50 disabled:opacity-60"
                                                    >
                                                        Удалить фото
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateAlbum(album)}
                                        disabled={saving}
                                        className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold disabled:opacity-60"
                                    >
                                        Сохранить
                                    </button>
                                    <a
                                        href={`/gallery/${album._id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl border border-brand-blue text-brand-blue font-bold"
                                    >
                                        Открыть альбом
                                    </a>
                                    <button
                                        onClick={() => deleteAlbum(album._id)}
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
