import { connectDB } from '@/lib/mongodb';
import Venue from '@/models/venue';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { venueId } = params;
    
    const venue = await Venue.findById(venueId).select('venueName email contact');
    
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      venueName: venue.venueName,
      email: venue.email,
      contact: venue.contact
    });
    
  } catch (error) {
    console.error('Error fetching venue contact:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}