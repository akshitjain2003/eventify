import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import { verifyToken } from "@/lib/authMiddleware";
import bcrypt from "bcrypt";
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const email = formData.get("email");
    const venueName = formData.get("venueName");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const logo = formData.get("logo");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Find venue by email
    const lowerCaseEmail = email.toLowerCase();
    const venue = await Venue.findOne({ email: lowerCaseEmail });

    if (!venue) {
      return Response.json({ error: "Venue not found" }, { status: 404 });
    }

    // Update basic info
    if (venueName) venue.venueName = venueName;
    if (contact) venue.contact = contact;
    if (address !== undefined && address !== null) venue.address = address;

    // Handle logo upload
    if (logo && logo.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${logo.name}`;
      const filePath = path.join(uploadsDir, fileName);
      const arrayBuffer = await logo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      
      // Update the first image (logo)
      venue.images[0] = `/uploads/${fileName}`;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ 
          error: "Current password is required to change password" 
        }, { status: 400 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, venue.password);
      if (!isPasswordValid) {
        return Response.json({ 
          error: "Current password is incorrect" 
        }, { status: 401 });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return Response.json({ 
          error: "New password must be at least 6 characters long" 
        }, { status: 400 });
      }

      // Hash and update password
      const salt = await bcrypt.genSalt(10);
      venue.password = await bcrypt.hash(newPassword, salt);
    }

    // Save the updated venue
    await venue.save();

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      venue: {
        venueName: venue.venueName,
        email: venue.email,
        contact: venue.contact,
        images: venue.images
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to update profile"
    }, { status: 500 });
  }
}


