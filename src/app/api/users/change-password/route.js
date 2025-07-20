import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/authMiddleware";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return Response.json({ 
        error: "Email, current password, and new password are required" 
      }, { status: 400 });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return Response.json({ 
        error: "New password must be at least 8 characters long" 
      }, { status: 400 });
    }

    // Find the user
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return Response.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return Response.json({
      success: true,
      message: "Password changed successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Failed to change password" 
    }, { status: 500 });
  }
}
