export function normalizeMediaUrl(url, hostOverride = "") {
    if (!url) return "";

    const stringValue = String(url).trim();
    const cleanedBackslashes = stringValue.replace(/\\/g, "/");

    if (/^https?:\/\//i.test(cleanedBackslashes)) return cleanedBackslashes;

    const host = getMediaHost(hostOverride);
    const withLeadingSlash = cleanedBackslashes.startsWith("/")
        ? cleanedBackslashes
        : `/${cleanedBackslashes}`;

    if (host) return `${host}${withLeadingSlash}`;

    return withLeadingSlash;
}

export function normalizeMediaFields(doc, fields, host) {
    if (!doc) return doc;

    const result = { ...doc };

    for (const field of fields) {
        const value = result[field];
        if (Array.isArray(value)) {
            result[field] = value.map((v) => normalizeMediaUrl(v, host));
        } else if (value !== undefined) {
            result[field] = normalizeMediaUrl(value, host);
        }
    }

    return result;
}

export function resolveMediaHost(req) {
    const envHost = getMediaHost();
    if (envHost) return envHost;
    if (req) return getRequestOrigin(req);
    return "";
}

export function getRequestOrigin(req) {
    const proto = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("x-forwarded-host") || req.get("host");
    if (!proto || !host) return "";
    return `${proto}://${host}`;
}

function getMediaHost(hostOverride = "") {
    const source = hostOverride || process.env.MEDIA_HOST || process.env.API_URL || "";
    return source.replace(/\/$/, "").replace(/\/api$/, "");
}
