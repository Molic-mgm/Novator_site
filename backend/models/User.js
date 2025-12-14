import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["admin", "manager", "editor", "viewer"], default: "viewer" }
    },
    { timestamps: true }
);

schema.methods.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
};

schema.methods.verifyPassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", schema);
