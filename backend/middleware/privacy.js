function maskPhone(phone = "") {
    const s = String(phone);
    if (s.length < 6) return "****";
    return s.slice(0, 3) + "****" + s.slice(-2);
}

function maskEmail(email = "") {
    const s = String(email);
    const at = s.indexOf("@");
    if (at <= 1) return "***";
    return s.slice(0, 2) + "***" + s.slice(at);
}

export function privacyForViewer(req, res, next) {
    // viewer — можно смотреть таблицу, но маскируем персональные поля
    const role = req.user?.role;
    if (role !== "viewer") return next();

    const json = res.json.bind(res);
    res.json = (data) => {
        const maskBooking = (b) => ({
            ...b,
            email: maskEmail(b.email),
            parentPhone: maskPhone(b.parentPhone),
            parent2Phone: maskPhone(b.parent2Phone),
            address: "***",
        });

        if (Array.isArray(data)) return json(data.map(maskBooking));
        if (data && typeof data === "object" && data.items && Array.isArray(data.items)) {
            return json({ ...data, items: data.items.map(maskBooking) });
        }
        if (data && typeof data === "object" && data._id && data.email) return json(maskBooking(data));
        return json(data);
    };

    next();
}
