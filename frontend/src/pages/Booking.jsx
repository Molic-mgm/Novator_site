import { useEffect, useMemo, useState } from "react";
import BookingForm from "../components/BookingForm";
import heroRocket from "../assets/hero-rocket.png";
import { apiFetch } from "../utils/api";

const DEFAULT_BOOKING_FORM = {
    title: "Анкета на бронирование путёвки в лагерь Новатор 2026",
    subtitle: "Выберите подходящую смену и заполните форму для бронирования.",
    consentText:
        "Я согласен(на) на обработку персональных данных в соответствии с Федеральным законом № 152-ФЗ от 27.07.2006 г.",
};

export default function Booking() {
    const [shifts, setShifts] = useState([]);
    const [selectedShiftId, setSelectedShiftId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingContent, setBookingContent] = useState(DEFAULT_BOOKING_FORM);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/shifts");
                setShifts(data);
                setSelectedShiftId(data[0]?._id || "");
            } catch (e) {
                setError(e.message || "Не удалось загрузить смены");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        apiFetch("/api/content/home")
            .then((data) => {
                const booking = data?.bookingForm || {};
                setBookingContent({
                    title: booking.title || DEFAULT_BOOKING_FORM.title,
                    subtitle: booking.subtitle || DEFAULT_BOOKING_FORM.subtitle,
                    consentText: booking.consentText || DEFAULT_BOOKING_FORM.consentText,
                });
            })
            .catch(() => {
                // fallback already in state
            });
    }, []);

    const selectedShift = useMemo(
        () => shifts.find(s => s._id === selectedShiftId) || shifts[0] || null,
        [selectedShiftId, shifts]
    );

    const shiftHeadline = selectedShift
        ? [selectedShift.title, selectedShift.dates].filter(Boolean).join(" — ")
        : "Смена пока не выбрана";

    return (
        <div className="relative min-h-screen overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-400" />
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-24">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <img
                        src={heroRocket}
                        alt="Ракета"
                        className="mx-auto mb-6 w-24 md:w-28 animate-[float_6s_ease-in-out_infinite]"
                        draggable={false}
                    />
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {bookingContent.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90">
                        {bookingContent.subtitle}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-gray-900">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-sm uppercase tracking-wide text-blue-600 font-bold">Смена 2026</div>
                            <div className="text-lg font-extrabold text-gray-900">{shiftHeadline}</div>
                        </div>
                        <div className="text-sm text-gray-600">Все ваши данные конфиденциальны.</div>
                    </div>

                    <BookingForm
                        shifts={shifts}
                        selectedShiftId={selectedShiftId}
                        onSelectShift={setSelectedShiftId}
                        fallbackShiftTitle="Зимняя смена «Снежный код»"
                        loadingShifts={loading}
                        loadingError={error}
                        consentText={bookingContent.consentText}
                    />
                </div>
            </div>
        </div>
    );
}
