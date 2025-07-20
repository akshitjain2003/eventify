import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { promises as fs } from 'fs';
import path from 'path';

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
    const images = formData.get("images");
console.log(images)
const result = schema.safeParse({ venueName, email, password, contact, location });
console.log(result)
    if (!result.success ) {
      return Response.json({ error: "Invalid or missing fields" }, { status: 400 });
    }

    // Check if uploads directory exists, if not create it
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save all images
    const imagePaths = [];
   
      const fileName = `${Date.now()}-${images.name}`;
      const filePath = path.join(uploadsDir, fileName);
      const arrayBuffer = await images.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      imagePaths.push(`/uploads/${fileName}`);
  

    await connectDB();
    const existingVenue = await Venue.findOne({ email });
    if (existingVenue) {
      return Response.json({ error: "Venue already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVenue = await Venue.create({
      venueName,
      email,
      password: hashedPassword,
      contact,
      location,
      images: imagePaths,
      isVerified: true,
    });

    // Create JWT token
    const token = jwt.sign(
      { venueId: newVenue._id, email: newVenue.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({ 
      message: "Venue created successfully",
      venue: {
        id: newVenue._id,
        venueName: newVenue.venueName,
        email: newVenue.email,
        contact: newVenue.contact,
        location: newVenue.location,
        images: newVenue.images
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error creating venue" }, { status: 500 });
  }
}