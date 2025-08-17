import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import Event from "@/models/event";
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

    // Find the venue
    const lowerCaseEmail = email.toLowerCase();
    const venue = await Venue.findOne({ email: lowerCaseEmail });

    if (!venue) {
      return Response.json({ error: "Venue not found" }, { status: 404 });
    }

    // Delete all events created by this venue
    await Event.deleteMany({ createdBy: venue._id });

    // Delete the venue
    await Venue.deleteOne({ email: lowerCaseEmail });

    return Response.json({
      success: true,
      message: "Account and all associated events deleted successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Delete venue account error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to delete account"
    }, { status: 500 });
  }
}