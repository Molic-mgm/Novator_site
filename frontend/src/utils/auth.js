const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * ====== SET ======
 * Используется в AdminLogin.jsx
 */
export function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Алиас (на будущее / совместимость)
 */
export const saveAuth = setAuth;

/**
 * ====== GET ======
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getRole() {
    const user = getUser();
    return user?.role || null;
}

/**
 * ====== CHECK ======
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * ====== CLEAR ======
 * Используется в PrivateRoute.jsx и logout
 */
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * ====== LOGOUT ======
 */
export function logout() {
    clearAuth();
}
