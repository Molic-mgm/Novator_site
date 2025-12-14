import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

const EMPTY = {
    name: "",
    position: "",
    photoUrl: "",
    photoFit: "cover",
    photoPosition: "center center",
    description: "",
};

export default function TeamEditor() {
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState("");
    const [formFile, setFormFile] = useState(null);
    const [pendingFiles, setPendingFiles] = useState({});

    const load = async () => {
        setLoading(true);
        setError("");
        setSaved("");
        try {
            const data = await apiFetch("/api/team");
            setMembers(data || []);
            setPendingFiles({});
        } catch (e) {
            console.error(e);
            setError(e.message || "Не удалось загрузить команду");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load().catch(() => {});
    }, []);

    const create = async () => {
        if (!form.name.trim()) return alert("Введите имя");
        if (!confirm("Добавить участника команды?")) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("position", form.position);
            fd.append("description", form.description);
            fd.append("photoFit", form.photoFit);
            fd.append("photoPosition", form.photoPosition);
            if (form.photoUrl) fd.append("photoUrl", form.photoUrl);
            if (formFile) fd.append("photo", formFile);

            await apiFetch("/api/team", { method: "POST", body: fd });
            setForm(EMPTY);
            setFormFile(null);
            setSaved("Участник добавлен");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const updateMember = async (member) => {
        if (!confirm("Сохранить изменения по этому человеку?")) return;
        setSaving(true);
        setSaved("");
        try {
            const fd = new FormData();
            const file = pendingFiles[member._id];

            fd.append("name", member.name || "");
            fd.append("position", member.position || "");
            fd.append("description", member.description || "");
            fd.append("photoFit", member.photoFit || "cover");
            fd.append("photoPosition", member.photoPosition || "center center");

            if (!file && member.photoUrl) fd.append("photoUrl", member.photoUrl);
            if (file) fd.append("photo", file);

            await apiFetch(`/api/team/${member._id}`, { method: "PUT", body: fd });
            setPendingFiles((prev) => ({ ...prev, [member._id]: null }));
            setSaved("Изменения сохранены");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!confirm("Удалить участника команды?")) return;
        setSaving(true);
        setSaved("");
        try {
            await apiFetch(`/api/team/${id}`, { method: "DELETE" });
            setSaved("Участник удалён");
            await load();
        } catch (e) {
            console.error(e);
            setError(e.message || "Ошибка удаления");
        } finally {
            setSaving(false);
        }
    };

    const updateLocal = (id, key, value) => {
        setMembers((prev) => prev.map((m) => (m._id === id ? { ...m, [key]: value } : m)));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold">Команда</h1>
                <p className="text-sm text-gray-500">Добавление должности, фото и описания.</p>
            </div>

            {error && <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
            {saved && !error && (
                <div className="bg-green-50 text-green-800 border border-green-100 rounded-xl px-4 py-3">✓ {saved}</div>
            )}

            <section className="card p-6 space-y-4">
                <div className="font-bold">Добавить участника</div>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        className="input"
                        placeholder="Имя"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Должность"
                        value={form.position}
                        onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Фото (URL)"
                        value={form.photoUrl}
                        onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                    />
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Отображение фото</div>
                        <select
                            className="input mt-1"
                            value={form.photoFit}
                            onChange={(e) => setForm((f) => ({ ...f, photoFit: e.target.value }))}
                        >
                            <option value="cover">Обрезать под карточку (cover)</option>
                            <option value="contain">Вписать без обрезки (contain)</option>
                        </select>
                    </label>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Фокус фото</div>
                        <select
                            className="input mt-1"
                            value={form.photoPosition}
                            onChange={(e) => setForm((f) => ({ ...f, photoPosition: e.target.value }))}
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
                            className="input mt-1"
                            onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                        />
                    </label>
                    <textarea
                        className="input min-h-[80px]"
                        placeholder="Описание"
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                </div>
                <button
                    onClick={create}
                    disabled={saving}
                    className="px-5 py-2 rounded-2xl font-extrabold text-white bg-novator-blue disabled:opacity-60"
                >
                    {saving ? "Сохранение…" : "Сохранить участника"}
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <div className="font-bold">Список команды</div>
                {loading ? (
                    <div>Загрузка…</div>
                ) : members.length === 0 ? (
                    <div className="text-sm text-slate-600">Команда пока пуста.</div>
                ) : (
                    <div className="space-y-4">
                        {members.map((m) => {
                            const pendingFile = pendingFiles[m._id];

                            return (
                                <div key={m._id} className="rounded-2xl border p-4 space-y-3">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <input
                                            className="input"
                                            value={m.name || ""}
                                            onChange={(e) => updateLocal(m._id, "name", e.target.value)}
                                            placeholder="Имя"
                                        />
                                        <input
                                            className="input"
                                            value={m.position || ""}
                                            onChange={(e) => updateLocal(m._id, "position", e.target.value)}
                                            placeholder="Должность"
                                        />
                                        <input
                                            className="input"
                                            value={m.photoUrl || ""}
                                            onChange={(e) => updateLocal(m._id, "photoUrl", e.target.value)}
                                            placeholder="Фото (URL)"
                                        />
                                        <label className="block">
                                            <div className="text-xs font-bold text-slate-600">Отображение фото</div>
                                            <select
                                                className="input mt-1"
                                                value={m.photoFit || "cover"}
                                                onChange={(e) => updateLocal(m._id, "photoFit", e.target.value)}
                                            >
                                                <option value="cover">Обрезать под карточку (cover)</option>
                                                <option value="contain">Вписать без обрезки (contain)</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <div className="text-xs font-bold text-slate-600">Фокус фото</div>
                                            <select
                                                className="input mt-1"
                                                value={m.photoPosition || "center center"}
                                                onChange={(e) => updateLocal(m._id, "photoPosition", e.target.value)}
                                            >
                                                <option value="center center">По центру</option>
                                                <option value="top center">Верх</option>
                                                <option value="bottom center">Низ</option>
                                                <option value="center left">Слева</option>
                                                <option value="center right">Справа</option>
                                            </select>
                                        </label>
                                        <div className="space-y-2">
                                            <div
                                                className="w-full max-w-xs overflow-hidden rounded-xl border bg-slate-50"
                                                style={{ aspectRatio: "3 / 4" }}
                                            >
                                                {m.photoUrl ? (
                                                    <img
                                                        src={toAbsoluteUrl(m.photoUrl)}
                                                        alt={m.name}
                                                        className={`h-full w-full ${m.photoFit === "contain" ? "object-contain" : "object-cover"}`}
                                                        style={{ objectPosition: m.photoPosition || "center center" }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                        Нет фото
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="input"
                                                onChange={(e) =>
                                                    setPendingFiles((prev) => ({
                                                        ...prev,
                                                        [m._id]: e.target.files?.[0] || null,
                                                    }))
                                                }
                                            />
                                            {pendingFile && (
                                                <div className="text-xs text-slate-600">Новый файл: {pendingFile.name}</div>
                                            )}
                                        </div>
                                        <textarea
                                            className="input min-h-[80px]"
                                            value={m.description || ""}
                                            onChange={(e) => updateLocal(m._id, "description", e.target.value)}
                                            placeholder="Описание"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => updateMember(m)}
                                            disabled={saving}
                                            className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold disabled:opacity-60"
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={() => remove(m._id)}
                                            disabled={saving}
                                            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold disabled:opacity-60"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
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
