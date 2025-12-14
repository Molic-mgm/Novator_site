import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // ❌ нет токена → только /admin/login
    if (!token) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // ✅ есть токен → пускаем в AdminShell
    return children;
}
