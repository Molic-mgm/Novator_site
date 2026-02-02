import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        apiFetch("/api/audit")
            .then((data) => {
                if (mounted) setLogs(data || []);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить лог"))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold">Лог действий</h1>
                <p className="text-sm text-gray-500">История изменений в админке.</p>
            </div>

            {loading && <div>Загрузка…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && (
                <div className="card overflow-hidden">
                    <div className="overflow-auto">
                        <table className="min-w-[900px] w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left">
                                    <th className="p-3">Дата</th>
                                    <th className="p-3">Пользователь</th>
                                    <th className="p-3">Роль</th>
                                    <th className="p-3">Метод</th>
                                    <th className="p-3">Путь</th>
                                    <th className="p-3">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="border-b border-slate-100">
                                        <td className="p-3 text-slate-600">{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
                                        <td className="p-3">{log.email || log.userId || "—"}</td>
                                        <td className="p-3">{log.role || "—"}</td>
                                        <td className="p-3 font-semibold">{log.method}</td>
                                        <td className="p-3 text-slate-600">{log.path}</td>
                                        <td className="p-3">{log.status}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td className="p-6 text-slate-600" colSpan={6}>
                                            Лог пока пуст.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
