import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function Team() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        apiFetch("/api/team")
            .then((data) => {
                if (mounted) setMembers(data || []);
            })
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-extrabold mb-6">Команда</h1>
                {loading ? (
                    <div>Загрузка…</div>
                ) : members.length === 0 ? (
                    <div className="text-slate-600">Команда появится здесь после добавления в админке.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {members.map((m) => (
                            <div key={m._id} className="rounded-2xl border p-5 shadow-sm">
                                {m.photoUrl && (
                                    <div
                                        className="w-full rounded-xl mb-4 border bg-slate-50 overflow-hidden"
                                        style={{ aspectRatio: "3 / 4" }}
                                    >
                                        <img
                                            src={toAbsoluteUrl(m.photoUrl)}
                                            alt={m.name}
                                            className={`h-full w-full ${m.photoFit === "contain" ? "object-contain" : "object-cover"}`}
                                            style={{ objectPosition: m.photoPosition || "center center" }}
                                        />
                                    </div>
                                )}
                                <div className="text-xl font-bold">{m.name}</div>
                                {m.position && (
                                    <div className="text-sm text-blue-600 font-semibold mt-1">{m.position}</div>
                                )}
                                {m.description && (
                                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{m.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
