import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import jwt from 'jsonwebtoken';

export async function GET(req) {
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

    // Fetch all events with venue information
    const events = await Event.find({})
      .populate('createdBy', 'venueName email location')
      .sort({ createdAt: -1 });

    return Response.json({ 
      events,
      count: events.length 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ 
      error: 'Failed to fetch events' 
    }, { status: 500 });
  }
}