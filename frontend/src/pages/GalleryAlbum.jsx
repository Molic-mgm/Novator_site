import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function GalleryAlbum() {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        apiFetch(`/api/gallery/${id}`)
            .then(setAlbum)
            .catch((e) => setError(e.message || "Не удалось загрузить альбом"))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-4 space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <div className="text-xs font-bold uppercase text-blue-600 tracking-[0.25em]">Галерея</div>
                        <h1 className="text-3xl font-extrabold">{album?.title || "Альбом"}</h1>
                        {album?.description && <p className="text-gray-600 max-w-3xl mt-2">{album.description}</p>}
                    </div>
                    <Link className="text-blue-600 font-semibold" to="/gallery">
                        ← Все альбомы
                    </Link>
                </div>

                {loading && <div className="text-gray-600">Загрузка...</div>}
                {error && <div className="text-rose-600">{error}</div>}

                {!loading && !error && album && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {album.photos?.map((photo, idx) => (
                            <img
                                key={idx}
                                src={toAbsoluteUrl(photo)}
                                alt={`${album.title} ${idx + 1}`}
                                className="w-full h-60 object-cover rounded-2xl shadow-sm"
                            />
                        ))}

                        {(!album.photos || album.photos.length === 0) && (
                            <div className="col-span-3 text-gray-600">Фотографии пока не добавлены.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
