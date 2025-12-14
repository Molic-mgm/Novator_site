import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getUser, logout } from "../utils/auth";

const apiHost = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/api$/, "");

export default function AdminShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getUser(); // { id, role, email }

    useEffect(() => {
        if (!user) navigate("/admin/login");
    }, [user, navigate]);

    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                logout();
                navigate("/admin/login", { replace: true });
            }, 30 * 60 * 1000); // 30 minutes
        };

        const events = ["mousemove", "keydown", "click", "scroll"];
        events.forEach((event) => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timeout);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [navigate]);

    useEffect(() => {
        let failures = 0;
        const interval = setInterval(async () => {
            try {
                await fetch(`${apiHost}/health`, { cache: "no-store" });
                failures = 0;
            } catch (e) {
                failures += 1;
                if (failures >= 2) {
                    window.location.reload();
                }
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const isActive = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(path + "/");

    const can = (roles) => roles.includes(user?.role);

    const handleLogout = () => {
        logout();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex">

            {/* ================= SIDEBAR ================= */}
            <aside className="w-72 bg-[#0B1220] text-white flex flex-col">

                {/* LOGO */}
                <div className="px-6 py-5 border-b border-white/10">
                    <div className="text-xl font-extrabold tracking-wide">
                        NOVATOR
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                        Admin Panel
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 px-4 py-6 space-y-1">

                    <NavItem to="/admin" active={isActive("/admin")}>
                        Смены
                    </NavItem>

                    {can(["admin", "editor", "manager"]) && (
                        <>
                            <NavItem
                                to="/admin/content"
                                active={isActive("/admin/content")}
                            >
                                Контент (Home)
                            </NavItem>

                            <NavItem
                                to="/admin/contacts"
                                active={isActive("/admin/contacts")}
                            >
                                Контакты
                            </NavItem>

                            <NavItem
                                to="/admin/team"
                                active={isActive("/admin/team")}
                            >
                                Команда
                            </NavItem>
                            {can(["admin", "manager"]) && (
                                <NavItem
                                    to="/admin/gallery"
                                    active={isActive("/admin/gallery")}
                                >
                                    Альбомы
                                </NavItem>
                            )}
                        </>
                    )}

                    {can(["admin", "manager", "viewer"]) && (
                        <NavItem
                            to="/admin/bookings"
                            active={isActive("/admin/bookings")}
                        >
                            Заявки
                        </NavItem>
                    )}

                    {can(["admin"]) && (
                        <NavItem
                            to="/admin/users"
                            active={isActive("/admin/users")}
                        >
                            Пользователи
                        </NavItem>
                    )}

                    <div className="pt-4 mt-6 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg transition"
                        >
                            Выйти из админки
                        </button>
                    </div>
                </nav>

                {/* USER */}
                <div className="px-6 py-4 border-t border-white/10 space-y-2">
                    <div className="text-sm font-semibold">
                        {user?.email}
                    </div>
                    <div className="text-xs text-white/50 capitalize">
                        роль: {user?.role}
                    </div>

                    <div className="pt-2">
                        <div className="text-[11px] text-white/60">Для выхода используйте кнопку выше.</div>
                    </div>
                </div>
            </aside>

            {/* ================= CONTENT ================= */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function NavItem({ to, active, children }) {
    return (
        <Link
            to={to}
            className={`
        block px-4 py-3 rounded-xl font-medium transition
        ${active
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white"}
      `}
        >
            {children}
        </Link>
    );
}
