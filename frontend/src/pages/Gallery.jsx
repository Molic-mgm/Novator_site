import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { toAbsoluteUrl } from "../utils/media";

export default function Gallery() {
    const [albums, setAlbums] = useState([]);
    const [header, setHeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([apiFetch("/api/gallery"), apiFetch("/api/content/site")])
            .then(([data, site]) => {
                const visible = (data || [])
                    .filter((album) => album.isActive !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setAlbums(visible);
                setHeader(site?.pageHeaders?.gallery || null);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить галерею"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 space-y-6">
                <div className="text-center space-y-2 animate-fade-up">
                    <div className="text-sm font-bold tracking-[0.25em] text-blue-600 uppercase">
                        {header?.eyebrow || "Галерея"}
                    </div>
                    <h1 className="text-4xl font-extrabold">
                        {header?.title || "Альбомы лагеря Новатор"}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {header?.subtitle || "Сохраняем яркие моменты с наших смен. Нажмите на альбом, чтобы посмотреть фото и видео."}
                    </p>
                </div>

                {loading && <div className="text-center text-gray-600">Загрузка...</div>}
                {error && <div className="text-center text-rose-600">{error}</div>}

                {!loading && !error && (
                    <div className="grid md:grid-cols-3 gap-5">
                        {albums.map((album) => (
                            <Link
                                to={`/gallery/${album._id}`}
                                key={album._id}
                                className="block card-surface overflow-hidden hover-lift transition bg-white"
                            >
                                {(() => {
                                    const preview = album.coverUrl || album.photos?.[0] || album.videos?.[0];
                                    if (!preview) return null;
                                    const previewUrl = toAbsoluteUrl(preview);
                                    const isVideo = /\.(mp4|webm|ogg)$/i.test(previewUrl);
                                    if (isVideo) {
                                        return (
                                            <video
                                                src={previewUrl}
                                                className="w-full h-48 object-cover bg-slate-50"
                                                muted
                                            />
                                        );
                                    }
                                    return (
                                        <img
                                            src={previewUrl}
                                            alt={album.title}
                                            className={`w-full h-48 ${album.coverFit === "cover" ? "object-cover" : "object-contain"} bg-slate-50`}
                                            style={{ objectPosition: album.coverPosition || "center center" }}
                                        />
                                    );
                                })()}
                                <div className="p-4 space-y-2">
                                    <div className="text-lg font-bold">{album.title}</div>
                                    {album.description && (
                                        <p className="text-sm text-gray-600">{album.description}</p>
                                    )}
                                    <div className="text-xs uppercase tracking-wide text-blue-600 font-bold">
                                        {album.photos?.length || 0} фото · {album.videos?.length || 0} видео
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {albums.length === 0 && (
                            <div className="col-span-3 text-center text-gray-600">
                                Альбомы появятся здесь после загрузки в админке.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
