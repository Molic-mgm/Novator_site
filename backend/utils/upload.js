import multer from "multer";
import path from "path";

export const uploadDir = process.env.UPLOAD_DIR || "uploads";

export function createUploader(prefix = "file") {
    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || "").toLowerCase();
            const safe = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            cb(null, `${safe}${ext}`);
        }
    });

    return multer({ storage });
}
