import React, { useEffect } from "react";
import BookingForm from "./BookingForm";
import Icon from "./Icon";

export default function BookingModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-slate-900/55" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="card w-full max-w-3xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg md:text-xl font-extrabold">
                                Анкета на бронирование путёвки в лагерь Новатор 2026
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                                Зимняя смена «Снежный код» • 03.01.2026 – 09.01.2026
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center"
                            aria-label="close"
                        >
                            <Icon name="close" className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[75vh] overflow-auto">
                        <BookingForm onSuccess={onClose} />
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                        <Icon name="shield" className="h-4 w-4" />
                        Персональные данные передаются по защищённому каналу и хранятся в базе данных.
                    </div>
                </div>
            </div>
        </div>
    );
}
