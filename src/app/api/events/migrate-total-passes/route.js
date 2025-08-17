import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/event';

export async function POST() {
  try {
    await connectDB();
    
    // Update all events that don't have totalPasses field
    const result = await Event.updateMany(
      { totalPasses: { $exists: false } },
      [{ $set: { totalPasses: "$numberOfPasses" } }]
    );
    
    return NextResponse.json({ 
      message: `Updated ${result.modifiedCount} events with totalPasses field`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}