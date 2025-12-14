import React from "react";

export default function Icon({ name, className = "h-6 w-6" }) {
    const common = {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        className,
    };

    switch (name) {
        case "phone":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a14 14 0 006 6v-1a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-1C8.268 21 3 15.732 3 9V5z" />
                </svg>
            );

        case "mail":
            return (
                <svg {...common}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
                </svg>
            );

        case "pin":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 22s8-4.5 8-10a8 8 0 10-16 0c0 5.5 8 10 8 10z" />
                </svg>
            );

        case "info":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8h.01" />
                </svg>
            );

        case "calendar":
            return (
                <svg {...common}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
            );

        case "code":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                </svg>
            );

        case "users":
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            );

        default:
            return null;
    }
}
