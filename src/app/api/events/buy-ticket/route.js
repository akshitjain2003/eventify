import { connectDB } from '@/lib/mongodb';
import Event from '@/models/event';
import Buyer from '@/models/buyer';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  console.log('=== BUY TICKET API CALLED ===');
  
  await connectDB();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log everything about the token
    console.log('=== TOKEN DEBUG ===');
    console.log('Full token:', JSON.stringify(decoded, null, 2));
    console.log('Token keys:', Object.keys(decoded));
    console.log('==================');
    
    const requestBody = await req.json();
    const { eventId, buyerName, buyerMobile, ticketQuantity } = requestBody;

    // Get current event data
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.numberOfPasses < ticketQuantity) {
      return NextResponse.json({ error: `Only ${event.numberOfPasses} tickets available` }, { status: 400 });
    }

    // Calculate new numberOfPasses but keep totalPasses unchanged
    const newNumberOfPasses = event.numberOfPasses - ticketQuantity;
    
    // Update only numberOfPasses field, explicitly preserve totalPasses
    await Event.updateOne(
      { _id: eventId },
      { 
        $set: { numberOfPasses: newNumberOfPasses },
        $unset: {} // Ensure no other fields are modified
      }
    );

    // Get updated event to return current state
    const updatedEvent = await Event.findById(eventId);

    const totalAmount = event.passPrice * ticketQuantity;
    
    // Try to find userId in any possible field
    const userId = decoded.userId || decoded.id || decoded.sub || decoded._id || decoded.venueId;
    
    console.log('=== USER ID DEBUG ===');
    console.log('userId:', decoded.userId);
    console.log('id:', decoded.id);
    console.log('sub:', decoded.sub);
    console.log('_id:', decoded._id);
    console.log('venueId:', decoded.venueId);
    console.log('Final userId chosen:', userId);
    console.log('====================');

    if (!userId) {
      return NextResponse.json({ error: 'No user ID found in token' }, { status: 401 });
    }

    const buyerData = {
      name: buyerName,
      mobile: buyerMobile,
      ticketQuantity: ticketQuantity,
      eventId: eventId,
      eventName: event.eventName,
      totalAmount: totalAmount,
      userId: userId,
    };

    console.log('Creating buyer with data:', JSON.stringify(buyerData, null, 2));

    const newBuyer = await Buyer.create(buyerData);
    
    console.log('Buyer created successfully:', JSON.stringify(newBuyer, null, 2));

    return NextResponse.json({ 
      message: `${ticketQuantity} ticket(s) purchased successfully for ${buyerName}!`,
      remainingPasses: updatedEvent.numberOfPasses,
      buyerId: newBuyer._id,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error('Buy ticket error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
















