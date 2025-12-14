import { useMemo, useState } from "react";
import { apiFetch } from "../utils/api";

const DEFAULT_SHIFT = "Зимняя смена \"Снежный код\" с 03.01.2026 по 09.01.2026";
const PHONE_PATTERN = "^(\\+7|8)9\\d{9}$";
const DEFAULT_CONSENT =
    "Я согласен(на) на обработку персональных данных в соответствии с Федеральным законом № 152-ФЗ от 27.07.2006 г.";

export default function BookingForm({
    shifts = [],
    selectedShiftId,
    onSelectShift,
    fallbackShiftTitle = DEFAULT_SHIFT,
    loadingShifts = false,
    loadingError = "",
    onSuccess,
    consentText = DEFAULT_CONSENT,
}) {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedShift = useMemo(
        () => shifts.find(s => s._id === selectedShiftId) || null,
        [selectedShiftId, shifts]
    );

    const shiftTitle = selectedShift?.title || fallbackShiftTitle;
    const shiftId = selectedShift?._id || "";

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());

        try {
            await apiFetch("/api/bookings", {
                method: "POST",
                body: JSON.stringify({
                    email: data.email,
                    shiftId: shiftId || undefined,
                    shiftTitle,
                    childFullName: data.childFullName,
                    dob: data.dob,
                    age: Number(data.age),
                    gender: data.gender,
                    parentFullName: data.parentFullName,
                    parentPhone: data.parentPhone,
                    parent2FullName: data.parent2FullName,
                    parent2Phone: data.parent2Phone,
                    address: data.address,
                    roommates: data.roommates,
                    district: data.district,
                    paymentType: data.paymentType,
                    allergies: data.allergies,
                    transfer: data.transfer,
                    agree: true,
                }),
            });

            setSent(true);
            e.target.reset();
            onSuccess?.();
        } catch (e) {
            alert(e.message || "Ошибка отправки. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center py-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Заявка отправлена 🚀</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Мы свяжемся с вами в ближайшее время и подтвердим бронирование путёвки.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Электронная почта *</span>
                    <input
                        name="email"
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="input mt-2"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Смена *</span>
                    <select
                        name="shiftId"
                        required={shifts.length > 0}
                        className="input mt-2 bg-slate-50 text-gray-600"
                        value={shiftId}
                        disabled={loadingShifts || shifts.length === 0}
                        onChange={(e) => onSelectShift?.(e.target.value)}
                    >
                        {loadingShifts && <option value="">Загрузка смен...</option>}
                        {!loadingShifts && shifts.length === 0 && <option value="">Смены пока не добавлены</option>}
                        {!loadingShifts && shifts.map(s => (
                            <option key={s._id} value={s._id}>
                                {[s.title, s.dates].filter(Boolean).join(" — ")}
                            </option>
                        ))}
                    </select>
                    {loadingError && <div className="text-sm text-rose-600 mt-1">{loadingError}</div>}
                    <div className="text-xs text-slate-500 mt-1">Название берётся из списка доступных смен.</div>
                </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">ФИО ребёнка полностью *</span>
                    <input name="childFullName" required className="input mt-2" placeholder="Иванов Иван Иванович" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="text-sm font-semibold text-gray-700">Дата рождения *</span>
                        <input name="dob" type="date" required className="input mt-2" />
                    </label>
                    <label className="block">
                        <span className="text-sm font-semibold text-gray-700">Возраст (полных лет) *</span>
                        <input name="age" type="number" min="6" max="18" required className="input mt-2" />
                    </label>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Пол *</div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" name="gender" value="М" defaultChecked required /> М
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" name="gender" value="Ж" /> Ж
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">ФИО родителя (для договора) *</span>
                    <input name="parentFullName" required className="input mt-2" placeholder="Родитель ФИО" />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Телефон родителя с WhatsApp *</span>
                    <input
                        name="parentPhone"
                        required
                        className="input mt-2"
                        placeholder="+79XXXXXXXXX"
                        pattern={PHONE_PATTERN}
                        title="Номер из 11 цифр, начинается с +79 или 89"
                        inputMode="tel"
                    />
                </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">ФИО второго родителя (при наличии)</span>
                    <input name="parent2FullName" className="input mt-2" placeholder="Родитель ФИО" />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Телефон второго родителя</span>
                    <input
                        name="parent2Phone"
                        className="input mt-2"
                        placeholder="+79XXXXXXXXX"
                        pattern={PHONE_PATTERN}
                        title="Номер из 11 цифр, начинается с +79 или 89"
                        inputMode="tel"
                    />
                </label>
            </div>

            <label className="block">
                <span className="text-sm font-semibold text-gray-700">Домашний адрес полностью с индексом *</span>
                <input name="address" required className="input mt-2" placeholder="Республика Башкортостан, ..." />
            </label>

            <label className="block">
                <span className="text-sm font-semibold text-gray-700">Пожелания по заселению (ФИО друзей) *</span>
                <input
                    name="roommates"
                    required
                    className="input mt-2"
                    placeholder="Укажите ФИО друзей/одноклассников одного возраста"
                />
            </label>

            <label className="block">
                <span className="text-sm font-semibold text-gray-700">Район (муниципалитет) школы ребёнка *</span>
                <input name="district" required className="input mt-2" placeholder="Например, Октябрьский р-н г. Уфы" />
            </label>

            <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Форма оплаты *</span>
                    <select
                        name="paymentType"
                        required
                        className="input mt-2 bg-slate-50 text-gray-700 font-semibold"
                        defaultValue="certificate"
                    >
                        <option value="certificate">По сертификату</option>
                        <option value="full">Полная оплата</option>
                    </select>
                    <div className="text-xs text-slate-500 mt-1">
                        Выберите подходящий способ оплаты.
                    </div>
                </label>
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Аллергия на лекарства / пища *</span>
                    <input
                        name="allergies"
                        required
                        className="input mt-2"
                        placeholder="Перечислите аллергию или укажите «нет»"
                    />
                </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Нужен ли трансфер из Уфы? *</div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" name="transfer" value="Да" defaultChecked required /> Да
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" name="transfer" value="Нет" /> Нет
                        </label>
                    </div>
                </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <input type="checkbox" name="agree" value="true" required className="mt-1" />
                <span>{consentText}</span>
            </label>

            <button
                disabled={loading}
                className="btn-primary w-full mt-2"
            >
                {loading ? "Отправка..." : "Отправить заявку"}
            </button>
        </form>
    );
}
