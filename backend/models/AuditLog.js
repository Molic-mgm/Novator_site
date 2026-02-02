import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "" },
        email: { type: String, default: "" },
        role: { type: String, default: "" },
        method: { type: String, default: "" },
        path: { type: String, default: "" },
        status: { type: Number, default: 0 },
        payload: { type: Object, default: {} },
    },
    { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);
