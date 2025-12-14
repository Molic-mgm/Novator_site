import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaReady, setCaptchaReady] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const captchaRef = useRef(null);
    const widgetId = useRef(null);

    const siteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || "1898a4f4-6000-49a4-87cc-a456c0dcf766";
    const captchaEnabled = Boolean(siteKey) && !isLocalhost;

    useEffect(() => {
        const host = window.location.hostname;
        setIsLocalhost(host === "localhost" || host === "127.0.0.1");
    }, []);

    useEffect(() => {
        if (!captchaEnabled) return;

        if (window.hcaptcha) {
            setCaptchaReady(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
        script.async = true;
        script.onload = () => setCaptchaReady(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!captchaEnabled || !captchaReady || !captchaRef.current || !window.hcaptcha || widgetId.current !== null) return;
        widgetId.current = window.hcaptcha.render(captchaRef.current, {
            sitekey: siteKey,
            callback: (token) => setCaptchaToken(token),
            "expired-callback": () => setCaptchaToken(""),
        });
    }, [captchaEnabled, captchaReady, siteKey]);

    const resetCaptcha = () => {
        if (widgetId.current !== null && window.hcaptcha) {
            window.hcaptcha.reset(widgetId.current);
        }
        setCaptchaToken("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (captchaEnabled && !captchaToken) {
            setError("Подтвердите, что вы не робот");
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password, captchaToken }),
            });

            // сохраняем токен
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            navigate("/admin");
        } catch (err) {
            setError(err.message || "Ошибка входа");
            resetCaptcha();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1220] to-[#0E1628] px-4">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-white">

                <h1 className="text-2xl font-bold mb-2 text-center">
                    Вход в админку
                </h1>
                <p className="text-sm text-white/60 mb-6 text-center">
                    Novator CMS
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />

                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-white/70 font-semibold mb-2">hCaptcha</div>
                        <div ref={captchaRef} className="flex justify-center" />
                        {!captchaReady && <div className="text-white/60 text-sm mt-2">Загрузка капчи...</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-600 transition px-4 py-3 font-semibold text-black disabled:opacity-50"
                    >
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-white/40">
                    Только для администраторов
                </div>
            </div>
        </div>
    );
}
