import { connectDB } from "@/lib/mongodb";
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

    const { eventId } = params;

    // Find and delete the event
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    return Response.json({ 
      message: 'Event deleted successfully',
      deletedEvent: deletedEvent.eventName
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting event:', error);
    return Response.json({ 
      error: 'Failed to delete event' 
    }, { status: 500 });
  }
}