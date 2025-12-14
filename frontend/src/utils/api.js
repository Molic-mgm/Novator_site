import axios from "axios";

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
export const API_BASE_RAW = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const API_BASE_URL = API_BASE_RAW.replace(/\/$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
});

/**
 * ===============================
 * JWT INTERCEPTOR
 * ===============================
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * ===============================
 * RESPONSE INTERCEPTOR
 * ( : auto logout)
 * ===============================
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            //     
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        return Promise.reject(error);
    }
);

/**
 * ===============================
 * UNIVERSAL API HELPER
 * ===============================
 *  :
 * - Home
 * - BookingForm
 * - AdminLogin
 * - ContentEditor
 */
export async function apiFetch(url, options = {}) {
    try {
        const method = options.method || "GET";
        const isFormData = options.body instanceof FormData;
        const rawBody = options.body;
        const data = (() => {
            if (!rawBody) return undefined;
            if (isFormData) return rawBody;
            if (typeof rawBody === "string") {
                try {
                    return JSON.parse(rawBody);
                } catch (_) {
                    return rawBody;
                }
            }
            return rawBody;
        })();

        const normalizedUrl = (() => {
            if (API_BASE_URL.endsWith("/api") && url.startsWith("/api")) {
                return url.slice(4);
            }
            return url;
        })();

        const headers = { ...(options.headers || {}) };
        if (!isFormData && rawBody && typeof data !== "string") {
            headers["Content-Type"] = headers["Content-Type"] || "application/json";
        }

        const res = await api.request({
            url: normalizedUrl,
            method,
            data,
            headers
        });

        return res.data;
    } catch (err) {
        const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            " API";

        throw new Error(message);
    }
}

/**
 * ===============================
 * EXPORT DEFAULT
 * ( ,   raw axios)
 * ===============================
 */
export default api;

