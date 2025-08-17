import { connectDB } from '@/lib/mongodb';
import Event from '@/models/event';
import Buyer from '@/models/buyer';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get('venueId');

    console.log('Fetching analytics for venueId:', venueId);

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 });
    }

    // Fetch all events for this venue
    const events = await Event.find({ createdBy: venueId })
      .sort({ createdAt: -1 });

    console.log(`Found ${events.length} events for venue ${venueId}`);

    // Get buyer data for each event
    const eventsWithAnalytics = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      
      try {
        // Fetch buyers for this event
        const buyers = await Buyer.find({ eventId: event._id });
        const ticketsSoldFromBuyers = buyers.reduce((total, buyer) => total + (buyer.ticketQuantity || 1), 0);
        const revenueFromBuyers = buyers.reduce((total, buyer) => total + (buyer.totalAmount || 0), 0);
        
        console.log(`Event ${eventObj.eventName}: buyers found=${buyers.length}, tickets=${ticketsSoldFromBuyers}`);
        
        return {
          ...eventObj,
          ticketsSold: ticketsSoldFromBuyers,
          revenue: revenueFromBuyers,
          originalPasses: eventObj.totalPasses || eventObj.numberOfPasses,
          soldPercentage: eventObj.numberOfPasses > 0 ? ((ticketsSoldFromBuyers / (eventObj.totalPasses || eventObj.numberOfPasses)) * 100).toFixed(1) : '0'
        };
      } catch (buyerError) {
        console.log('Error fetching buyers, using event data only');
        
        // Fallback calculation
        const originalPasses = eventObj.totalPasses || eventObj.numberOfPasses;
        const currentPasses = eventObj.numberOfPasses || 0;
        const ticketsSold = Math.max(0, originalPasses - currentPasses);
        const revenue = ticketsSold * (eventObj.passPrice || 0);
        
        return {
          ...eventObj,
          ticketsSold,
          revenue,
          originalPasses,
          soldPercentage: originalPasses > 0 ? ((ticketsSold / originalPasses) * 100).toFixed(1) : '0'
        };
      }
    }));

    return NextResponse.json({ 
      events: eventsWithAnalytics,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
}




