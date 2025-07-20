import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
  venueName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Venue || mongoose.model("Venue", venueSchema);