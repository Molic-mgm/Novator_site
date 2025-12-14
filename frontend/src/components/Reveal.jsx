import React, { useEffect, useRef, useState } from "react";

export default function Reveal({ children, className = "", delay = 0, from = "up" }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const base = "transition-all duration-700 will-change-transform";
    const hidden =
        from === "left"
            ? "opacity-0 -translate-x-6"
            : from === "right"
                ? "opacity-0 translate-x-6"
                : "opacity-0 translate-y-6";

    const visible = "opacity-100 translate-x-0 translate-y-0";

    return (
        <div
            ref={ref}
            className={`${base} ${show ? visible : hidden} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
