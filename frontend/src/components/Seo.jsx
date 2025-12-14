import React, { useEffect } from "react";

export default function Seo({ title, description, jsonLd }) {
    useEffect(() => {
        if (title) document.title = title;

        if (description) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute("name", "description");
                document.head.appendChild(meta);
            }
            meta.setAttribute("content", description);
        }

        // JSON-LD
        const id = "jsonld-schema";
        const old = document.getElementById(id);
        if (old) old.remove();

        if (jsonLd) {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.id = id;
            script.text = JSON.stringify(jsonLd);
            document.head.appendChild(script);
        }

        return () => {
            // оставляем title/description; jsonld можно убрать при уходе со страницы:
            // (если хочешь сохранять — убери этот cleanup)
            const s = document.getElementById(id);
            if (s) s.remove();
        };
    }, [title, description, jsonLd]);

    return null;
}
