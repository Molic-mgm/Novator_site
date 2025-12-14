import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-100 flex">
            <aside className="w-64 bg-slate-900 text-white p-6">
                <h2 className="text-lg font-bold mb-6">Admin</h2>
                <nav className="space-y-2">
                    <a href="/admin" className="block hover:text-blue-400">Смены</a>
                    <a href="/admin/content" className="block hover:text-blue-400">Контент</a>
                    <a href="/admin/contacts" className="block hover:text-blue-400">Контакты</a>
                    <a href="/admin/team" className="block hover:text-blue-400">Команда</a>
                    <a href="/admin/gallery" className="block hover:text-blue-400">Галерея</a>
                    <a href="/admin/bookings" className="block hover:text-blue-400">Заявки</a>
                    <a href="/admin/users" className="block hover:text-blue-400">Пользователи</a>
                </nav>
            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
