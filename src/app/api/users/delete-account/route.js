import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/authMiddleware";

export async function DELETE(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find and delete the user
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await User.deleteOne({ email: lowerCaseEmail });

    return Response.json({
      success: true,
      message: "Account deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to delete account"
    }, { status: 500 });
  }
}