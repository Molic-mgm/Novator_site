import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log("Usage: npm run create-admin -- admin@mail.com password123");
    process.exit(1);
}

await connectDB(process.env.MONGO_URI);

const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
if (exists) {
    console.log("Admin already exists:", exists.email);
    process.exit(0);
}

const u = new User({ email: String(email).toLowerCase().trim(), role: "admin" });
await u.setPassword(password);
await u.save();

console.log("✅ Admin created:", u.email);
await mongoose.disconnect();
