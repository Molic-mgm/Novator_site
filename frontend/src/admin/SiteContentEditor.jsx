import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api";
import { mergeSiteContent } from "../utils/siteContent";

const EMPTY_ABOUT = { title: "", text: "", imageUrl: "", group: "", groupOrder: 0, order: 0, isActive: true };
const EMPTY_PROGRAM = { key: "", title: "", description: "", order: 0, isActive: true, directions: [] };
const EMPTY_DIRECTION = { title: "", description: "", imageUrl: "", order: 0, isActive: true };
const EMPTY_PARENT = {
    slug: "",
    title: "",
    body: "",
    imageUrl: "",
    listItems: [],
    listGroups: { allowed: [], disallowed: [], conditional: [] },
    files: [],
    order: 0,
    isActive: true,
};
const EMPTY_DOCUMENT = { title: "", description: "", date: "", fileUrl: "", imageUrl: "", order: 0, isActive: true };
const EMPTY_MENU = { title: "", path: "", parentId: "", order: 0, isActive: true };
const EMPTY_SCHEDULE_ITEM = { time: "", label: "" };

export default function SiteContentEditor() {
    const [data, setData] = useState(mergeSiteContent({}));
    const [initial, setInitial] = useState(mergeSiteContent({}));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let mounted = true;
        apiFetch("/api/content/site")
            .then((res) => {
                if (!mounted) return;
                const merged = mergeSiteContent(res || {});
                setData(merged);
                setInitial(merged);
            })
            .catch((e) => setError(e.message || "Не удалось загрузить структуру сайта"))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, []);

    const changed = useMemo(() => JSON.stringify(data) !== JSON.stringify(initial), [data, initial]);

    const updateNested = (key, index, patch) => {
        setData((prev) => {
            const list = prev[key].map((item, idx) => (idx === index ? { ...item, ...patch } : item));
            return { ...prev, [key]: list };
        });
    };

    const addItem = (key, template) => setData((prev) => ({ ...prev, [key]: [...prev[key], template] }));
    const removeItem = (key, index) =>
        setData((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== index) }));

    const uploadFile = async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        const response = await apiFetch("/api/uploads", { method: "POST", body: fd });
        return response.url;
    };

    const save = async () => {
        if (!changed) return;
        if (!confirm("Сохранить структуру сайта?")) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await apiFetch("/api/content/site", {
                method: "PUT",
                body: JSON.stringify(data),
            });
            setInitial(data);
            setSuccess("Изменения сохранены");
            setTimeout(() => setSuccess(""), 2000);
        } catch (e) {
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="bg-white rounded-2xl shadow p-6">Загрузка…</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">Структура сайта</h1>
                    <p className="text-sm text-gray-500">Разделы, меню, документы и контент для страниц.</p>
                </div>
                <button
                    onClick={save}
                    disabled={!changed || saving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg disabled:opacity-50"
                >
                    {saving ? "Сохранение…" : "Сохранить"}
                </button>
            </div>

            {error && <Banner kind="error" text={error} />}
            {success && <Banner kind="success" text={success} />}

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Заголовки страниц</h2>
                <PageHeaderEditor
                    label="О лагере"
                    value={data.pageHeaders?.about}
                    onChange={(about) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, about },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Программы"
                    value={data.pageHeaders?.programs}
                    onChange={(programs) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, programs },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Родителям"
                    value={data.pageHeaders?.parents}
                    onChange={(parents) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, parents },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Документы"
                    value={data.pageHeaders?.documents}
                    onChange={(documents) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, documents },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Вакансии"
                    value={data.pageHeaders?.vacancies}
                    onChange={(vacancies) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, vacancies },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Команда"
                    value={data.pageHeaders?.team}
                    onChange={(team) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, team },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Галерея"
                    value={data.pageHeaders?.gallery}
                    onChange={(gallery) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, gallery },
                        }))
                    }
                />
                <PageHeaderEditor
                    label="Смены"
                    value={data.pageHeaders?.shifts}
                    onChange={(shifts) =>
                        setData((prev) => ({
                            ...prev,
                            pageHeaders: { ...prev.pageHeaders, shifts },
                        }))
                    }
                />
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Меню сайта</h2>
                <div className="space-y-3">
                    {data.menu.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="grid md:grid-cols-5 gap-3">
                            <input
                                className="input"
                                placeholder="Название"
                                value={item.title || ""}
                                onChange={(e) => updateNested("menu", index, { title: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Путь"
                                value={item.path || ""}
                                onChange={(e) => updateNested("menu", index, { path: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Parent ID"
                                value={item.parentId || ""}
                                onChange={(e) => updateNested("menu", index, { parentId: e.target.value })}
                            />
                            <input
                                type="number"
                                className="input"
                                value={item.order || 0}
                                onChange={(e) => updateNested("menu", index, { order: Number(e.target.value) })}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={item.isActive !== false}
                                    onChange={(e) => updateNested("menu", index, { isActive: e.target.checked })}
                                />
                                Активно
                            </label>
                            <button
                                type="button"
                                onClick={() => removeItem("menu", index)}
                                className="text-rose-600 text-sm font-semibold"
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addItem("menu", { ...EMPTY_MENU })}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить пункт
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Раздел «О лагере»</h2>
                {data.aboutBlocks.map((block, index) => (
                    <div key={`${block.title}-${index}`} className="rounded-2xl border p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                            <input
                                className="input"
                                placeholder="Заголовок"
                                value={block.title || ""}
                                onChange={(e) => updateNested("aboutBlocks", index, { title: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Подгруппа"
                                value={block.group || ""}
                                onChange={(e) => updateNested("aboutBlocks", index, { group: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Фото (URL)"
                                value={block.imageUrl || ""}
                                onChange={(e) => updateNested("aboutBlocks", index, { imageUrl: e.target.value })}
                            />
                            <input
                                type="file"
                                onChange={async (e) => {
                                    const fileData = e.target.files?.[0];
                                    if (!fileData) return;
                                    const url = await uploadFile(fileData);
                                    updateNested("aboutBlocks", index, { imageUrl: url });
                                }}
                            />
                            <input
                                type="number"
                                className="input"
                                placeholder="Порядок"
                                value={block.order || 0}
                                onChange={(e) => updateNested("aboutBlocks", index, { order: Number(e.target.value) })}
                            />
                            <input
                                type="number"
                                className="input"
                                placeholder="Порядок подгруппы"
                                value={block.groupOrder || 0}
                                onChange={(e) => updateNested("aboutBlocks", index, { groupOrder: Number(e.target.value) })}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={block.isActive !== false}
                                    onChange={(e) => updateNested("aboutBlocks", index, { isActive: e.target.checked })}
                                />
                                Показывать
                            </label>
                        </div>
                        <textarea
                            className="input min-h-[90px]"
                            placeholder="Описание"
                            value={block.text || ""}
                            onChange={(e) => updateNested("aboutBlocks", index, { text: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => removeItem("aboutBlocks", index)}
                            className="text-rose-600 text-sm font-semibold"
                        >
                            Удалить блок
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addItem("aboutBlocks", { ...EMPTY_ABOUT })}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить блок
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Расписание</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        className="input"
                        placeholder="Заголовок расписания"
                        value={data.schedule?.title || ""}
                        onChange={(e) => setData((prev) => ({ ...prev, schedule: { ...prev.schedule, title: e.target.value } }))}
                    />
                </div>
                <div className="space-y-3">
                    {(data.schedule?.items || []).map((item, index) => (
                        <div key={`${item[0]}-${index}`} className="grid md:grid-cols-[160px_1fr_auto] gap-3 items-start">
                            <input
                                className="input"
                                placeholder="Время"
                                value={item[0] || ""}
                                onChange={(e) => {
                                    const updated = [...(data.schedule?.items || [])];
                                    updated[index] = [e.target.value, item[1] || ""];
                                    setData((prev) => ({ ...prev, schedule: { ...prev.schedule, items: updated } }));
                                }}
                            />
                            <input
                                className="input"
                                placeholder="Активность"
                                value={item[1] || ""}
                                onChange={(e) => {
                                    const updated = [...(data.schedule?.items || [])];
                                    updated[index] = [item[0] || "", e.target.value];
                                    setData((prev) => ({ ...prev, schedule: { ...prev.schedule, items: updated } }));
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = (data.schedule?.items || []).filter((_, idx) => idx !== index);
                                    setData((prev) => ({ ...prev, schedule: { ...prev.schedule, items: updated } }));
                                }}
                                className="text-rose-600 text-sm font-semibold"
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        const updated = [...(data.schedule?.items || []), [EMPTY_SCHEDULE_ITEM.time, EMPTY_SCHEDULE_ITEM.label]];
                        setData((prev) => ({ ...prev, schedule: { ...prev.schedule, items: updated } }));
                    }}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить строку
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Программы</h2>
                {data.programs.map((program, index) => (
                    <div key={`${program.title}-${index}`} className="rounded-2xl border p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-3">
                            <input
                                className="input"
                                placeholder="Ключ (slug)"
                                value={program.key || ""}
                                onChange={(e) => updateNested("programs", index, { key: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Название программы"
                                value={program.title || ""}
                                onChange={(e) => updateNested("programs", index, { title: e.target.value })}
                            />
                            <input
                                type="number"
                                className="input"
                                placeholder="Порядок"
                                value={program.order || 0}
                                onChange={(e) => updateNested("programs", index, { order: Number(e.target.value) })}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={program.isActive !== false}
                                    onChange={(e) => updateNested("programs", index, { isActive: e.target.checked })}
                                />
                                Показывать
                            </label>
                        </div>
                        <textarea
                            className="input min-h-[90px]"
                            placeholder="Описание"
                            value={program.description || ""}
                            onChange={(e) => updateNested("programs", index, { description: e.target.value })}
                        />
                        <div className="space-y-3">
                            <div className="text-sm font-bold text-slate-600">Направления</div>
                            {(program.directions || []).map((direction, dirIndex) => (
                                <div key={`${direction.title}-${dirIndex}`} className="grid md:grid-cols-2 gap-3 border rounded-xl p-3">
                                    <input
                                        className="input"
                                        placeholder="Название"
                                        value={direction.title || ""}
                                        onChange={(e) => {
                                            const next = [...(program.directions || [])];
                                            next[dirIndex] = { ...direction, title: e.target.value };
                                            updateNested("programs", index, { directions: next });
                                        }}
                                    />
                                    <input
                                        className="input"
                                        placeholder="Фото (URL)"
                                        value={direction.imageUrl || ""}
                                        onChange={(e) => {
                                            const next = [...(program.directions || [])];
                                            next[dirIndex] = { ...direction, imageUrl: e.target.value };
                                            updateNested("programs", index, { directions: next });
                                        }}
                                    />
                                    <input
                                        type="file"
                                        onChange={async (e) => {
                                            const fileData = e.target.files?.[0];
                                            if (!fileData) return;
                                            const url = await uploadFile(fileData);
                                            const next = [...(program.directions || [])];
                                            next[dirIndex] = { ...direction, imageUrl: url };
                                            updateNested("programs", index, { directions: next });
                                        }}
                                    />
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Порядок"
                                        value={direction.order || 0}
                                        onChange={(e) => {
                                            const next = [...(program.directions || [])];
                                            next[dirIndex] = { ...direction, order: Number(e.target.value) };
                                            updateNested("programs", index, { directions: next });
                                        }}
                                    />
                                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={direction.isActive !== false}
                                            onChange={(e) => {
                                                const next = [...(program.directions || [])];
                                                next[dirIndex] = { ...direction, isActive: e.target.checked };
                                                updateNested("programs", index, { directions: next });
                                            }}
                                        />
                                        Показывать
                                    </label>
                                    <textarea
                                        className="input min-h-[80px] md:col-span-2"
                                        placeholder="Описание"
                                        value={direction.description || ""}
                                        onChange={(e) => {
                                            const next = [...(program.directions || [])];
                                            next[dirIndex] = { ...direction, description: e.target.value };
                                            updateNested("programs", index, { directions: next });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = (program.directions || []).filter((_, idx) => idx !== dirIndex);
                                            updateNested("programs", index, { directions: next });
                                        }}
                                        className="text-rose-600 text-sm font-semibold"
                                    >
                                        Удалить направление
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const next = [...(program.directions || []), { ...EMPTY_DIRECTION }];
                                    updateNested("programs", index, { directions: next });
                                }}
                                className="px-4 py-2 rounded-xl border text-sm font-semibold"
                            >
                                Добавить направление
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem("programs", index)}
                            className="text-rose-600 text-sm font-semibold"
                        >
                            Удалить программу
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addItem("programs", { ...EMPTY_PROGRAM })}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить программу
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Раздел «Родителям»</h2>
                {data.parentsSections.map((section, index) => (
                    <div key={`${section.title}-${index}`} className="rounded-2xl border p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                            <input
                                className="input"
                                placeholder="Slug"
                                value={section.slug || ""}
                                onChange={(e) => updateNested("parentsSections", index, { slug: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Заголовок"
                                value={section.title || ""}
                                onChange={(e) => updateNested("parentsSections", index, { title: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Фото (URL)"
                                value={section.imageUrl || ""}
                                onChange={(e) => updateNested("parentsSections", index, { imageUrl: e.target.value })}
                            />
                            <input
                                type="file"
                                onChange={async (e) => {
                                    const fileData = e.target.files?.[0];
                                    if (!fileData) return;
                                    const url = await uploadFile(fileData);
                                    updateNested("parentsSections", index, { imageUrl: url });
                                }}
                            />
                            <input
                                type="number"
                                className="input"
                                placeholder="Порядок"
                                value={section.order || 0}
                                onChange={(e) => updateNested("parentsSections", index, { order: Number(e.target.value) })}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={section.isActive !== false}
                                    onChange={(e) => updateNested("parentsSections", index, { isActive: e.target.checked })}
                                />
                                Показывать
                            </label>
                        </div>
                        <textarea
                            className="input min-h-[90px]"
                            placeholder="Описание"
                            value={section.body || ""}
                            onChange={(e) => updateNested("parentsSections", index, { body: e.target.value })}
                        />
                        <TextareaList
                            label="Список"
                            value={section.listItems || []}
                            onChange={(listItems) => updateNested("parentsSections", index, { listItems })}
                        />
                        <TextareaList
                            label="Можно"
                            value={section.listGroups?.allowed || []}
                            onChange={(allowed) =>
                                updateNested("parentsSections", index, {
                                    listGroups: { ...(section.listGroups || {}), allowed },
                                })
                            }
                        />
                        <TextareaList
                            label="Нельзя"
                            value={section.listGroups?.disallowed || []}
                            onChange={(disallowed) =>
                                updateNested("parentsSections", index, {
                                    listGroups: { ...(section.listGroups || {}), disallowed },
                                })
                            }
                        />
                        <TextareaList
                            label="По согласованию"
                            value={section.listGroups?.conditional || []}
                            onChange={(conditional) =>
                                updateNested("parentsSections", index, {
                                    listGroups: { ...(section.listGroups || {}), conditional },
                                })
                            }
                        />
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-slate-600">Файлы</div>
                            {(section.files || []).map((file, fileIndex) => (
                                <div key={`${file.title}-${fileIndex}`} className="grid md:grid-cols-2 gap-3">
                                    <input
                                        className="input"
                                        placeholder="Название файла"
                                        value={file.title || ""}
                                        onChange={(e) => {
                                            const files = [...(section.files || [])];
                                            files[fileIndex] = { ...file, title: e.target.value };
                                            updateNested("parentsSections", index, { files });
                                        }}
                                    />
                                    <input
                                        className="input"
                                        placeholder="URL файла"
                                        value={file.url || ""}
                                        onChange={(e) => {
                                            const files = [...(section.files || [])];
                                            files[fileIndex] = { ...file, url: e.target.value };
                                            updateNested("parentsSections", index, { files });
                                        }}
                                    />
                                    <input
                                        type="file"
                                        onChange={async (e) => {
                                            const fileData = e.target.files?.[0];
                                            if (!fileData) return;
                                            const url = await uploadFile(fileData);
                                            const files = [...(section.files || [])];
                                            files[fileIndex] = { ...file, url };
                                            updateNested("parentsSections", index, { files });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const files = section.files.filter((_, idx) => idx !== fileIndex);
                                            updateNested("parentsSections", index, { files });
                                        }}
                                        className="text-rose-600 text-sm font-semibold"
                                    >
                                        Удалить файл
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const files = [...(section.files || []), { title: "", url: "" }];
                                    updateNested("parentsSections", index, { files });
                                }}
                                className="px-4 py-2 rounded-xl border text-sm font-semibold"
                            >
                                Добавить файл
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem("parentsSections", index)}
                            className="text-rose-600 text-sm font-semibold"
                        >
                            Удалить раздел
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addItem("parentsSections", { ...EMPTY_PARENT })}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить раздел
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Документы</h2>
                {data.documents.map((doc, index) => (
                    <div key={`${doc.title}-${index}`} className="rounded-2xl border p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                            <input
                                className="input"
                                placeholder="Название"
                                value={doc.title || ""}
                                onChange={(e) => updateNested("documents", index, { title: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Дата"
                                value={doc.date || ""}
                                onChange={(e) => updateNested("documents", index, { date: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Ссылка на файл"
                                value={doc.fileUrl || ""}
                                onChange={(e) => updateNested("documents", index, { fileUrl: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Фото (URL)"
                                value={doc.imageUrl || ""}
                                onChange={(e) => updateNested("documents", index, { imageUrl: e.target.value })}
                            />
                            <input
                                type="number"
                                className="input"
                                placeholder="Порядок"
                                value={doc.order || 0}
                                onChange={(e) => updateNested("documents", index, { order: Number(e.target.value) })}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={doc.isActive !== false}
                                    onChange={(e) => updateNested("documents", index, { isActive: e.target.checked })}
                                />
                                Показывать
                            </label>
                            <input
                                type="file"
                                onChange={async (e) => {
                                    const fileData = e.target.files?.[0];
                                    if (!fileData) return;
                                    const url = await uploadFile(fileData);
                                    updateNested("documents", index, { fileUrl: url });
                                }}
                            />
                            <input
                                type="file"
                                onChange={async (e) => {
                                    const fileData = e.target.files?.[0];
                                    if (!fileData) return;
                                    const url = await uploadFile(fileData);
                                    updateNested("documents", index, { imageUrl: url });
                                }}
                            />
                        </div>
                        <textarea
                            className="input min-h-[80px]"
                            placeholder="Описание"
                            value={doc.description || ""}
                            onChange={(e) => updateNested("documents", index, { description: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => removeItem("documents", index)}
                            className="text-rose-600 text-sm font-semibold"
                        >
                            Удалить документ
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addItem("documents", { ...EMPTY_DOCUMENT })}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold"
                >
                    Добавить документ
                </button>
            </section>

            <section className="card p-6 space-y-4">
                <h2 className="text-lg font-bold">Главный экран «Смены»</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    <input
                        className="input"
                        placeholder="Заголовок"
                        value={data.shiftsHero.title || ""}
                        onChange={(e) => setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, title: e.target.value } }))}
                    />
                    <input
                        className="input"
                        placeholder="Подзаголовок"
                        value={data.shiftsHero.subtitle || ""}
                        onChange={(e) => setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, subtitle: e.target.value } }))}
                    />
                    <input
                        className="input"
                        placeholder="Фото (URL)"
                        value={data.shiftsHero.imageUrl || ""}
                        onChange={(e) => setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, imageUrl: e.target.value } }))}
                    />
                    <input
                        type="file"
                        onChange={async (e) => {
                            const fileData = e.target.files?.[0];
                            if (!fileData) return;
                            const url = await uploadFile(fileData);
                            setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, imageUrl: url } }));
                        }}
                    />
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Как показывать фото</div>
                        <select
                            className="input mt-1"
                            value={data.shiftsHero.imageFit || "cover"}
                            onChange={(e) => setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, imageFit: e.target.value } }))}
                        >
                            <option value="cover">Обрезать под блок (cover)</option>
                            <option value="contain">Вписать без обрезки (contain)</option>
                        </select>
                    </label>
                    <label className="block">
                        <div className="text-xs font-bold text-slate-600">Фокус фото</div>
                        <select
                            className="input mt-1"
                            value={data.shiftsHero.imagePosition || "center center"}
                            onChange={(e) => setData((prev) => ({ ...prev, shiftsHero: { ...prev.shiftsHero, imagePosition: e.target.value } }))}
                        >
                            <option value="center center">По центру</option>
                            <option value="top center">Верх</option>
                            <option value="bottom center">Низ</option>
                            <option value="center left">Слева</option>
                            <option value="center right">Справа</option>
                        </select>
                    </label>
                </div>
            </section>

            <style>{`
                .input {
                    width: 100%;
                    border: 1px solid rgba(15,23,42,0.12);
                    border-radius: 12px;
                    padding: 10px 12px;
                    outline: none;
                }
                .input:focus {
                    border-color: rgba(59,130,246,0.7);
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                }
            `}</style>
        </div>
    );
}

function TextareaList({ label, value, onChange }) {
    return (
        <label className="block">
            <div className="text-xs font-bold text-slate-600">{label}</div>
            <textarea
                className="input min-h-[90px] mt-1"
                value={(value || []).join("\n")}
                onChange={(e) => onChange(e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
            />
        </label>
    );
}

function Banner({ kind, text }) {
    const styles = kind === "error"
        ? "bg-red-50 text-red-700 border border-red-100"
        : "bg-green-50 text-green-800 border border-green-100";
    return <div className={`${styles} rounded-xl px-4 py-3`}>{text}</div>;
}

function PageHeaderEditor({ label, value, onChange }) {
    const current = value || {};
    return (
        <div className="rounded-2xl border p-4 space-y-2">
            <div className="text-sm font-bold text-slate-600">{label}</div>
            <div className="grid md:grid-cols-3 gap-3">
                <input
                    className="input"
                    placeholder="Подзаголовок (eyebrow)"
                    value={current.eyebrow || ""}
                    onChange={(e) => onChange({ ...current, eyebrow: e.target.value })}
                />
                <input
                    className="input"
                    placeholder="Заголовок"
                    value={current.title || ""}
                    onChange={(e) => onChange({ ...current, title: e.target.value })}
                />
                <input
                    className="input"
                    placeholder="Описание"
                    value={current.subtitle || ""}
                    onChange={(e) => onChange({ ...current, subtitle: e.target.value })}
                />
            </div>
        </div>
    );
}
