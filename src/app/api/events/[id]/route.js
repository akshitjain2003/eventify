import { connectDB } from '@/lib/mongodb';
import Event from '@/models/event';

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(event), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
