import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/authMiddleware";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Parse form data
    const formData = await req.formData();
    const email = formData.get("email");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Update basic info
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ 
          error: "Current password is required to change password" 
        }, { status: 400 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return Response.json({ 
          error: "Current password is incorrect" 
        }, { status: 401 });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return Response.json({ 
          error: "New password must be at least 8 characters long" 
        }, { status: 400 });
      }

      // Hash and update password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Save the updated user
    await user.save();

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
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


