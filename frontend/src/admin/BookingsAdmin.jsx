import React, { useEffect, useState } from "react";
import api, { apiFetch } from "../utils/api";
import { getRole } from "../utils/auth";

export default function BookingsAdmin() {
    const role = getRole() || "viewer";
    const canManage = role === "admin" || role === "manager";

    const [items, setItems] = useState([]);
    const [shifts, setShifts] = useState([]);

    const [status, setStatus] = useState("active");
    const [shiftId, setShiftId] = useState("");
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState([]);

    const wideCell = "p-3 whitespace-pre-wrap break-words align-top leading-5 text-[15px]";
    const narrowCell = `${wideCell} max-w-[180px]`;

    const load = async () => {
        const params = new URLSearchParams();
        params.set("status", status);
        if (shiftId) params.set("shiftId", shiftId);
        if (q.trim()) params.set("q", q.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const [s, b] = await Promise.all([
            apiFetch("/api/shifts"),
            apiFetch("/api/bookings?" + params.toString()),
        ]);
        setShifts(s);
        setItems(b);
        setSelected([]);
    };

    const safeLoad = () => load().catch((e) => alert(e.message));

    useEffect(() => { safeLoad(); }, [status, shiftId, from, to]);

    const archive = async (id) => {
        await apiFetch(`/api/bookings/${id}/archive`, { method: "PATCH" });
        await load();
    };

    const restore = async (id) => {
        await apiFetch(`/api/bookings/${id}/restore`, { method: "PATCH" });
        await load();
    };

    const bulkAction = async (action) => {
        if (!selected.length) return;
        const confirmText =
            action === "archive"
                ? "Отправить выбранные заявки в архив?"
                : "Восстановить выбранные заявки из архива?";
        if (!confirm(confirmText)) return;

        setSaving(true);
        try {
            await Promise.all(
                selected.map((id) =>
                    apiFetch(`/api/bookings/${id}/${action}`, { method: "PATCH" })
                )
            );
            await load();
        } catch (e) {
            alert(e.message || "Не удалось выполнить действие");
        } finally {
            setSaving(false);
        }
    };

    const toggleSelected = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = (checked) => {
        setSelected(checked ? items.map((b) => b._id) : []);
    };
    const updateField = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }));
    const openEdit = (item) => {
        setEditing({
            ...item,
            shiftId: item.shift?._id || item.shiftId || "",
            dob: item.dob ? item.dob.slice(0, 10) : "",
            paymentType: item.paymentType || "certificate",
        });
    };

    const saveEdit = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const shiftTitle =
                editing.shiftTitle ||
                shifts.find((s) => s._id === editing.shiftId)?.title ||
                "Смена";
            await apiFetch(`/api/bookings/${editing._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    email: editing.email,
                    shiftId: editing.shiftId || undefined,
                    shiftTitle,
                    childFullName: editing.childFullName,
                    dob: editing.dob,
                    age: Number(editing.age || 0),
                    gender: editing.gender,
                    parentFullName: editing.parentFullName,
                    parentPhone: editing.parentPhone,
                    parent2FullName: editing.parent2FullName,
                    parent2Phone: editing.parent2Phone,
                    address: editing.address,
                    roommates: editing.roommates,
                    district: editing.district,
                    paymentType: editing.paymentType || "certificate",
                    allergies: editing.allergies,
                    transfer: editing.transfer,
                    agree: editing.agree ?? true,
                    status: editing.status,
                })
            });
            setEditing(null);
            await load();
        } catch (e) {
            alert(e.message || "Не удалось сохранить заявку");
        } finally {
            setSaving(false);
        }
    };
    const exportExcel = async () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Нет токена авторизации");

        const params = new URLSearchParams();
        params.set("status", status);
        if (shiftId) params.set("shiftId", shiftId);
        if (q.trim()) params.set("q", q.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        try {
            const response = await api.get("/api/bookings/export/excel", {
                params,
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bookings.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.message ||
                    error.message ||
                    "Не удалось выгрузить Excel"
            );
        }
    };


    return (
        <div>
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <div className="text-2xl font-extrabold">Бронирования</div>
                    <div className="text-sm text-slate-600">Фильтры + архив заявок (manager/admin).</div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={safeLoad}
                        className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-extrabold shadow-lg hover:bg-blue-700"
                    >
                        Обновить
                    </button>
                    <button
                        onClick={exportExcel}
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
                    >
                        Экспорт в Excel
                    </button>
                    {canManage && selected.length > 0 && (
                        <div className="flex gap-2 items-center text-xs text-slate-600">
                            <span className="font-semibold">С выбранными ({selected.length}):</span>
                            <button
                                onClick={() => bulkAction("archive")}
                                disabled={saving}
                                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow disabled:opacity-60"
                            >
                                В архив
                            </button>
                            <button
                                onClick={() => bulkAction("restore")}
                                disabled={saving}
                                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow disabled:opacity-60"
                            >
                                Восстановить
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <form className="card p-4 mt-6 grid md:grid-cols-5 gap-3" onSubmit={(e) => { e.preventDefault(); safeLoad(); }}>
                <label className="block">
                    <div className="text-xs font-extrabold text-slate-600">Статус</div>
                    <select className="mt-1 w-full px-3 py-2 rounded-2xl border" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="active">Активные</option>
                        <option value="archived">Архив</option>
                    </select>
                </label>

                <label className="block">
                    <div className="text-xs font-extrabold text-slate-600">Смена</div>
                    <select className="mt-1 w-full px-3 py-2 rounded-2xl border" value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
                        <option value="">Все</option>
                        {shifts.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                    </select>
                </label>

                <label className="block md:col-span-1">
                    <div className="text-xs font-extrabold text-slate-600">Поиск</div>
                    <input className="mt-1 w-full px-3 py-2 rounded-2xl border" value={q} onChange={(e) => setQ(e.target.value)} placeholder="email/ФИО/телефон" />
                    <button type="submit" className="mt-2 w-full px-3 py-2 rounded-2xl bg-slate-900 text-white font-extrabold">
                        Применить
                    </button>
                </label>

                <label className="block">
                    <div className="text-xs font-extrabold text-slate-600">С даты</div>
                    <input type="date" className="mt-1 w-full px-3 py-2 rounded-2xl border" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>

                <label className="block">
                    <div className="text-xs font-extrabold text-slate-600">По дату</div>
                    <input type="date" className="mt-1 w-full px-3 py-2 rounded-2xl border" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>
            </form>

            <div className="card mt-6 overflow-hidden">
                <div className="overflow-auto">
                    <table className="min-w-[1300px] w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left">
                                {canManage && (
                                    <th className="p-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selected.length === items.length && items.length > 0}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                        />
                                    </th>
                                )}
                                <th className="p-3">Дата</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Смена</th>
                                <th className="p-3">Ребёнок</th>
                                <th className="p-3">Родитель</th>
                                <th className="p-3">Телефон</th>
                                <th className="p-3">Оплата</th>
                                <th className="p-3">Статус</th>
                                <th className="p-3">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((b) => (
                                <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                                    {canManage && (
                                        <td className="p-3 align-top">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(b._id)}
                                                onChange={() => toggleSelected(b._id)}
                                            />
                                        </td>
                                    )}
                                    <td className={`${narrowCell} text-slate-600`} title={new Date(b.createdAt).toLocaleString("ru-RU")}>{new Date(b.createdAt).toLocaleString("ru-RU")}</td>
                                    <td className={`${wideCell} font-semibold max-w-[320px]`} title={b.email}>{b.email}</td>
                                    <td className={`${wideCell} max-w-[320px]`} title={b.shift?.title || b.shiftTitle || "-"}>{b.shift?.title || b.shiftTitle || "-"}</td>
                                    <td className={`${wideCell} max-w-[320px]`} title={b.childFullName || b.childName || "-"}>{b.childFullName || b.childName || "-"}</td>
                                    <td className={`${wideCell} max-w-[320px]`} title={b.parentFullName || b.parentName || "-"}>{b.parentFullName || b.parentName || "-"}</td>
                                    <td className={narrowCell} title={b.parentPhone || "-"}>{b.parentPhone || "-"}</td>
                                    <td className={`${wideCell} max-w-[240px]`} title={b.paymentType === "full" ? "Полная оплата" : "Сертификат"}>
                                        {b.paymentType === "full" ? "Полная оплата" : "Сертификат"}
                                    </td>
                                    <td className={`${wideCell} max-w-[160px]`} title={b.status === "archived" ? "Архив" : "Активна"}>{b.status === "archived" ? "Архив" : "Активна"}</td>
                                    <td className="p-3 space-x-2 whitespace-nowrap">
                                        {!canManage ? (
                                            <span className="text-slate-400">—</span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => openEdit(b)}
                                                    className="px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-900 text-white"
                                                >
                                                    Редактировать
                                                </button>
                                                {b.status === "archived" ? (
                                                    <button onClick={() => restore(b._id).catch(e => alert(e.message))} className="px-3 py-2 rounded-xl text-xs font-extrabold bg-novator-blue text-white">
                                                        Восстановить
                                                    </button>
                                                ) : (
                                                    <button onClick={() => archive(b._id).catch(e => alert(e.message))} className="px-3 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white">
                                                        В архив
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td className="p-6 text-slate-600" colSpan={canManage ? 10 : 9}>
                                        Ничего не найдено.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-xs uppercase tracking-wide text-blue-600 font-bold">Редактирование</div>
                                <div className="text-2xl font-extrabold">Заявка {editing.email}</div>
                            </div>
                            <button className="text-slate-500" onClick={() => setEditing(null)}>✕</button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Email
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.email || ""} onChange={(e) => updateField("email", e.target.value)} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Смена
                                <select className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.shiftId} onChange={(e) => updateField("shiftId", e.target.value)}>
                                    <option value="">—</option>
                                    {shifts.map((s) => (
                                        <option key={s._id} value={s._id}>{s.title}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                ФИО ребёнка
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.childFullName || ""} onChange={(e) => updateField("childFullName", e.target.value)} />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Дата рождения
                                    <input type="date" className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.dob || ""} onChange={(e) => updateField("dob", e.target.value)} />
                                </label>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Возраст
                                    <input type="number" className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.age || ""} onChange={(e) => updateField("age", e.target.value)} />
                                </label>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Пол
                                <select className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.gender || ""} onChange={(e) => updateField("gender", e.target.value)}>
                                    <option value="М">М</option>
                                    <option value="Ж">Ж</option>
                                </select>
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Статус заявки
                                <select className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.status || "active"} onChange={(e) => updateField("status", e.target.value)}>
                                    <option value="active">Активна</option>
                                    <option value="archived">Архив</option>
                                </select>
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Родитель (ФИО)
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.parentFullName || ""} onChange={(e) => updateField("parentFullName", e.target.value)} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Телефон
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.parentPhone || ""} onChange={(e) => updateField("parentPhone", e.target.value)} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Второй родитель
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.parent2FullName || ""} onChange={(e) => updateField("parent2FullName", e.target.value)} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Телефон 2
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.parent2Phone || ""} onChange={(e) => updateField("parent2Phone", e.target.value)} />
                            </label>
                        </div>

                        <label className="block text-sm font-semibold text-slate-700">
                            Адрес
                            <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.address || ""} onChange={(e) => updateField("address", e.target.value)} />
                        </label>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Пожелания по заселению
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.roommates || ""} onChange={(e) => updateField("roommates", e.target.value)} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Район школы
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.district || ""} onChange={(e) => updateField("district", e.target.value)} />
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Оплата
                                <select
                                    className="w-full px-3 py-2 rounded-xl border mt-1 bg-slate-50 text-slate-800 font-semibold"
                                    value={editing.paymentType || "certificate"}
                                    onChange={(e) => updateField("paymentType", e.target.value)}
                                >
                                    <option value="certificate">По сертификату</option>
                                    <option value="full">Полная оплата</option>
                                </select>
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Аллергии
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.allergies || ""} onChange={(e) => updateField("allergies", e.target.value)} />
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Трансфер
                                <select className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.transfer || "Да"} onChange={(e) => updateField("transfer", e.target.value)}>
                                    <option value="Да">Да</option>
                                    <option value="Нет">Нет</option>
                                </select>
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                                Название смены (для отчётов)
                                <input className="w-full px-3 py-2 rounded-xl border mt-1" value={editing.shiftTitle || ""} onChange={(e) => updateField("shiftTitle", e.target.value)} />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button className="px-4 py-2 rounded-xl border" onClick={() => setEditing(null)}>Отмена</button>
                            <button
                                className="px-4 py-2 rounded-xl bg-novator-blue text-white font-extrabold"
                                disabled={saving}
                                onClick={saveEdit}
                            >
                                {saving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
