import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import { verifyToken } from "@/lib/authMiddleware";

export async function GET(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get venue ID from token or request
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const venue = await Venue.findById(decoded.id).select('-password');

    if (!venue) {
      return Response.json({ error: "Venue not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      venue
    }, { status: 200 });
  } catch (error) {
    console.error("Get venue profile error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to get venue profile"
    }, { status: 500 });
  }
}