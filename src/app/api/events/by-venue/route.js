import { connectDB } from '@/lib/mongodb';
import Event from '@/models/event';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get('id');

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    const events = await Event.find({ createdBy: venueId });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events by venue:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
