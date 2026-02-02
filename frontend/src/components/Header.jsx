import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-novator.png";

const MENU = [
    { label: "Состав", to: "/team" },
    { label: "Смены", to: "/shifts" },
    { label: "О лагере", to: "/about" },
    { label: "Программы", to: "/programs" }
];

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = location.pathname.startsWith("/admin");

    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [menuItems, setMenuItems] = useState(MENU);
    const lastScroll = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY;
            if (current > lastScroll.current && current > 120) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            lastScroll.current = current;
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        setMenuItems(MENU);
    }, []);

    if (isAdmin) return null;

    const linkClass = ({ isActive }) =>
        `relative inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold transition
        ${isActive ? "text-blue-700" : "text-slate-600 hover:text-blue-700"}`;

    const menuTree = useMemo(() => {
        const nodes = menuItems.map((item) => ({ ...item, children: [] }));
        const lookup = new Map();
        nodes.forEach((node) => {
            lookup.set(node.id, node);
            lookup.set(node.to, node);
            lookup.set(node.label, node);
        });
        const roots = [];
        nodes.forEach((node) => {
            if (node.parentId && lookup.has(node.parentId)) {
                lookup.get(node.parentId).children.push(node);
            } else {
                roots.push(node);
            }
        });
        const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0);
        roots.sort(sortByOrder);
        roots.forEach((root) => root.children.sort(sortByOrder));
        return roots;
    }, [menuItems]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 overflow-hidden transition-transform duration-500
            ${hidden ? "-translate-y-28" : "translate-y-0"}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-indigo-50 opacity-95" />
            <div className="absolute inset-0 backdrop-blur-xl border-b border-white/70 shadow-[0_8px_40px_-24px_rgba(59,130,246,0.65)]" />
            <div className="relative max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between gap-4 py-3 md:py-4">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 border border-blue-100 shadow-sm hover:bg-white"
                        aria-label="Открыть меню"
                    >
                        <span className="relative w-6 h-6">
                            <span className={`absolute left-0 right-0 h-0.5 rounded-full bg-slate-900 transition duration-300 ${open ? "translate-y-2.5 rotate-45" : "top-1"}`} />
                            <span className={`absolute left-0 right-0 top-2.5 h-0.5 rounded-full bg-slate-900 transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
                            <span className={`absolute left-0 right-0 h-0.5 rounded-full bg-slate-900 transition duration-300 ${open ? "-translate-y-2.5 -rotate-45" : "top-4"}`} />
                        </span>
                    </button>

                    {/* LOGO */}
                    <NavLink to="/" className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 blur" />
                            <img
                                src={logo}
                                alt="Новатор"
                                className="relative h-14 md:h-16 w-16 md:w-32 drop-shadow-sm object-contain"
                                draggable={false}
                            />
                        </div>
                        
                    </NavLink>

                    <div className="flex flex-1 items-center justify-end gap-6">
                        {/* DESKTOP */}
                        <nav className="hidden md:flex items-center gap-2 rounded-full bg-white/60 px-2 py-1 shadow-inner shadow-blue-100 border border-white/60">
                            {menuTree.map((item) => (
                                <div key={item.to} className="relative group">
                                    <NavLink to={item.to} className={linkClass}>
                                        <span className="relative z-10">{item.label}</span>
                                        <span className={`absolute inset-0 rounded-full transition duration-300 ${location.pathname === item.to ? "bg-blue-50" : "bg-blue-50/0 group-hover:bg-blue-50"}`} />
                                        <span className={`absolute left-3 right-3 -bottom-1 h-0.5 rounded-full origin-left transition ${location.pathname === item.to ? "bg-blue-500 scale-x-100" : "bg-blue-200 scale-x-0 group-hover:scale-x-100"}`} />
                                    </NavLink>
                                    {item.children.length > 0 && (
                                        <div className="absolute left-0 top-full mt-2 hidden min-w-[200px] rounded-2xl border bg-white shadow-lg group-hover:block animate-fade-up">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.to}
                                                    to={child.to}
                                                    className="block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50/60"
                                                >
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* CTA */}
                        <div className="flex items-center gap-3 self-center">
                            <button
                                onClick={() => navigate("/booking")}
                                className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600
                                text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-blue-200/60
                                hover:from-blue-700 hover:to-indigo-700 transition"
                            >
                                <span className="h-2 w-2 rounded-full bg-white/90 shadow-sm pulse-ring" />
                                Забронировать
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {open && (
                <div className="md:hidden bg-white/95 border-t border-blue-50 backdrop-blur shadow-lg shadow-blue-100/60">
                    <nav className="flex flex-col py-4">
                        {menuTree.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `px-6 py-3 text-sm font-semibold transition ${isActive ? "text-blue-700 bg-blue-50" : "hover:bg-blue-50/60"}`}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        {menuTree.flatMap((item) => item.children).map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `px-8 py-2 text-sm font-semibold transition ${isActive ? "text-blue-700 bg-blue-50" : "hover:bg-blue-50/60"}`}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <button
                            onClick={() => navigate("/booking")}
                            className="mx-6 mt-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold shadow-md shadow-blue-200/70"
                        >
                            Забронировать
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
