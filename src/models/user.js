import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String },
  image: { type: String },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
