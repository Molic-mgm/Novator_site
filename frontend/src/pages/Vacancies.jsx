import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const INITIAL_FORM = {
    fullName: "",
    email: "",
    phone: "",
    message: "",
};

export default function Vacancies() {
    const [items, setItems] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeVacancy, setActiveVacancy] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([apiFetch("/api/vacancies"), apiFetch("/api/content/site")])
            .then(([data, site]) => {
                if (!active) return;
                setItems(data || []);
                setHeader(site?.pageHeaders?.vacancies || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить вакансии"))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (!activeVacancy) return;
        setSending(true);
        setError("");
        setSuccess("");
        try {
            await apiFetch(`/api/vacancies/${activeVacancy}/responses`, {
                method: "POST",
                body: JSON.stringify(form),
            });
            setSuccess("Отклик отправлен! Мы свяжемся с вами.");
            setForm(INITIAL_FORM);
            setActiveVacancy(null);
        } catch (e) {
            setError(e.message || "Не удалось отправить отклик");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-8">
            <div className="text-center animate-fade-up">
                <div className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">
                    {header?.eyebrow || "Вакансии"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
                    {header?.title || "Работа в лагере"}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    {header?.subtitle || "Присоединяйтесь к команде «Новатора»."}
                </p>
            </div>

            {loading && <div className="text-center text-gray-600">Загрузка...</div>}
            {error && <div className="text-center text-rose-600">{error}</div>}
            {success && <div className="text-center text-emerald-600">{success}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item._id} className="card-surface p-5 hover-lift">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="text-lg font-extrabold">{item.title}</div>
                                    {item.description && (
                                        <div className="text-gray-700 mt-2 whitespace-pre-line">{item.description}</div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setActiveVacancy(item._id)}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                                >
                                    Откликнуться
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center text-gray-600">Вакансии пока не опубликованы.</div>
                    )}
                </div>
            )}

            {activeVacancy && (
                <form onSubmit={submit} className="card-surface p-6 space-y-4">
                    <div className="text-xl font-extrabold">Отклик на вакансию</div>
                    <input
                        className="w-full px-3 py-2 rounded-2xl border"
                        placeholder="ФИО"
                        value={form.fullName}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                    />
                    <input
                        className="w-full px-3 py-2 rounded-2xl border"
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                    />
                    <input
                        className="w-full px-3 py-2 rounded-2xl border"
                        placeholder="Телефон"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                    />
                    <textarea
                        className="w-full px-3 py-2 rounded-2xl border min-h-[120px]"
                        placeholder="Комментарий"
                        value={form.message}
                        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-60"
                        >
                            {sending ? "Отправка..." : "Отправить"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveVacancy(null)}
                            className="px-5 py-2.5 rounded-xl border font-bold"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
