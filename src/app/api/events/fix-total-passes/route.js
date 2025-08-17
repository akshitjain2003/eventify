import { connectDB } from '@/lib/mongodb';
import Event from '@/models/event';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await connectDB();
    
    // For events without totalPasses, set it to current numberOfPasses + sold tickets
    // This assumes numberOfPasses is the remaining count
    const events = await Event.find({});
    
    for (const event of events) {
      if (!event.totalPasses || event.totalPasses === event.numberOfPasses) {
        // Set totalPasses to a reasonable value (you might need to adjust this logic)
        await Event.findByIdAndUpdate(event._id, {
          totalPasses: event.numberOfPasses // or set to original value if known
        });
      }
    }
    
    return NextResponse.json({ 
      message: `Fixed totalPasses for events`,
      count: events.length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
