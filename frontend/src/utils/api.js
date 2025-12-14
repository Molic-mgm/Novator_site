import axios from "axios";

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
const fallbackApi = runtimeOrigin ? `${runtimeOrigin}/api` : "/api";

const runtimeConfig = typeof window !== "undefined" ? window.__APP_CONFIG__ || window.__ENV_CONFIG__ : null;
const runtimeApiUrl = runtimeConfig?.apiUrl || runtimeConfig?.API_URL;

export const API_BASE_RAW = (import.meta.env.VITE_API_URL || runtimeApiUrl || fallbackApi).replace(/\/$/, "");
export const API_BASE_URL = API_BASE_RAW || fallbackApi;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
});

const stripApiPrefix = (url = "") => {
    if (!url) return url;

    // Remove any number of leading "/api" segments to avoid double-prefixing
    // when the baseURL already ends with "/api".
    let stripped = url;
    while (
        stripped === "api" ||
        stripped === "/api" ||
        stripped.startsWith("api/") ||
        stripped.startsWith("/api/")
    ) {
        stripped = stripped.replace(/^\/?api\/?/, "");
    }

    return stripped.startsWith("/") ? stripped : `/${stripped}`;
};

export const normalizeApiPath = (url = "") => (
    API_BASE_URL.endsWith("/api") ? stripApiPrefix(url) : url
);

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

        // Prevent double /api/api prefix when baseURL already contains "/api"
        if (API_BASE_URL.endsWith("/api")) {
            config.url = stripApiPrefix(config.url);
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

        const normalizedUrl = API_BASE_URL.endsWith("/api") ? stripApiPrefix(url) : url;

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

