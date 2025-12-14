import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ email: "", password: "", role: "viewer" });
    const [roleEdits, setRoleEdits] = useState({});

    const load = async () => {
        const data = await apiFetch("/api/users");
        setUsers(data);
        setRoleEdits(Object.fromEntries((data || []).map((u) => [u._id, u.role])));
    };

    useEffect(() => { load().catch(e => alert(e.message)); }, []);

    const create = async (roleOverride) => {
        const payload = { ...form, role: roleOverride || form.role };
        await apiFetch("/api/users", { method: "POST", body: JSON.stringify(payload) });
        setForm({ email: "", password: "", role: "viewer" });
        await load();
    };

    const setRole = async (id, role) => {
        await apiFetch(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
        await load();
    };

    const reset = async (id) => {
        const oldPassword = prompt("Введите текущий пароль пользователя:");
        if (!oldPassword) return;
        const password = prompt("Новый пароль (мин 6 символов):");
        if (!password) return;
        await apiFetch(`/api/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password, oldPassword }) });
        alert("Пароль обновлён ✅");
    };

    const removeAdmin = async (id, email) => {
        if (!window.confirm(`Удалить администратора ${email}?`)) return;

        const secret = prompt("Введите секретный пароль для удаления администратора:");
        if (!secret) return;

        await apiFetch(`/api/users/${id}`, { method: "DELETE", body: JSON.stringify({ secret }) });
        await load();
        alert("Администратор удалён ✅");
    };

    return (
        <div>
            <div className="text-2xl font-extrabold">Пользователи</div>
            <div className="text-sm text-slate-600 mt-1">Только admin может создавать/менять роли.</div>

            <div className="card p-6 mt-6">
                <div className="font-extrabold">Создать пользователя</div>
                <div className="grid md:grid-cols-3 gap-3 mt-4">
                    <input className="px-3 py-2 rounded-2xl border" placeholder="email"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    <input
                        className="px-3 py-2 rounded-2xl border"
                        placeholder="password"
                        type="password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <select className="px-3 py-2 rounded-2xl border"
                        value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        className="px-5 py-2.5 rounded-2xl font-extrabold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-300/60 transition"
                        onClick={() => create()}
                    >
                        Создать пользователя
                    </button>
                    <button
                        className="px-5 py-2.5 rounded-2xl font-extrabold text-white bg-novator-blue hover:bg-blue-700 shadow-md transition"
                        onClick={() => create("admin")}
                    >
                        Создать админа
                    </button>
                </div>
            </div>

            <div className="card p-6 mt-6">
                <div className="font-extrabold mb-3">Список</div>
                <div className="space-y-3">
                    {users.map(u => (
                        <div key={u._id} className="border rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="font-extrabold">{u.email}</div>
                                <div className="text-sm text-slate-600">роль: {u.role}</div>
                            </div>

                            <div className="flex gap-2 items-center">
                                <select className="px-3 py-2 rounded-2xl border" value={roleEdits[u._id] || u.role}
                                    onChange={e => setRoleEdits((prev) => ({ ...prev, [u._id]: e.target.value }))}>
                                    <option value="admin">admin</option>
                                    <option value="manager">manager</option>
                                    <option value="editor">editor</option>
                                    <option value="viewer">viewer</option>
                                </select>
                                <button className="px-3 py-2 rounded-2xl font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-sm" onClick={() => setRole(u._id, roleEdits[u._id] || u.role)}>
                                    Сохранить
                                </button>
                                <button className="px-3 py-2 rounded-2xl font-extrabold bg-amber-500 text-white hover:bg-amber-600 shadow-sm" onClick={() => reset(u._id)}>
                                    Сброс пароля
                                </button>
                                {u.role === "admin" && (
                                    <button className="px-3 py-2 rounded-2xl font-extrabold bg-red-600 text-white hover:bg-red-700 shadow-sm" onClick={() => removeAdmin(u._id, u.email)}>
                                        Удалить админа
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <div className="text-slate-600">Пользователей нет.</div>}
                </div>
            </div>
        </div>
    );
}
