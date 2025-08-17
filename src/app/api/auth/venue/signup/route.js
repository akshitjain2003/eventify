import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary"; // ✅ Cloudinary config file

const schema = z.object({
  venueName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  contact: z.string().min(10),
  location: z.string().min(10),
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const venueName = formData.get("venueName");
    const email = formData.get("email").toLowerCase();
    const password = formData.get("password");
    const contact = formData.get("contact");
    const location = formData.get("location");
    const images = formData.get("images"); // single file (change to getAll for multiple)

    const result = schema.safeParse({ venueName, email, password, contact, location });
    if (!result.success) {
      return Response.json({ error: "Invalid or missing fields" }, { status: 400 });
    }

    await connectDB();
    const existingVenue = await Venue.findOne({ email });
    if (existingVenue) {
      return Response.json({ error: "Venue already exists" }, { status: 400 });
    }

    // Upload to Cloudinary
    let imageUrls = [];
    if (images && typeof images.name === "string") {
      const fileBytes = await images.arrayBuffer();
      const buffer = Buffer.from(fileBytes);

      const base64Image = `data:${images.type};base64,${buffer.toString("base64")}`;

      const uploadRes = await cloudinary.uploader.upload(base64Image, {
        folder: `Venues/${venueName}`,
        public_id: Date.now().toString(),
      });

      imageUrls.push(uploadRes.secure_url);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVenue = await Venue.create({
      venueName,
      email,
      password: hashedPassword,
      contact,
      location,
      images: imageUrls,
      isVerified: true,
    });

    // Create JWT token
    const token = jwt.sign(
      { venueId: newVenue._id, email: newVenue.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json(
      {
        message: "Venue created successfully",
        venue: {
          id: newVenue._id,
          venueName: newVenue.venueName,
          email: newVenue.email,
          contact: newVenue.contact,
          location: newVenue.location,
          images: newVenue.images,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error creating venue" }, { status: 500 });
  }
}
