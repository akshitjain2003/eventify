import { connectDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import Event from "@/models/event";
import jwt from 'jsonwebtoken';

export async function DELETE(req, { params }) {
  try {
    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'superadmin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (err) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { venueId } = params;

    if (!venueId) {
      return Response.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    // Find the venue first
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return Response.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Delete all events created by this venue
    await Event.deleteMany({ createdBy: venueId });

    // Delete the venue
    await Venue.findByIdAndDelete(venueId);

    return Response.json({ 
      success: true,
      message: 'Venue and all associated events deleted successfully',
      deletedVenue: {
        id: venueId,
        venueName: venue.venueName,
        email: venue.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting venue:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to delete venue' 
    }, { status: 500 });
  }
}