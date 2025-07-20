import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import Event from '@/models/event';
import { connectDB } from '@/lib/mongodb';

export async function PUT(req, { params }) {
  await connectDB();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formData = await req.formData();

    const eventId = params.id;
    console.log(eventId)
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Ensure only the creator can update the event
    if (existingEvent.createdBy.toString() !== decoded.venueId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const eventName = formData.get('eventName') || existingEvent.eventName;
    const eventDescription = formData.get('eventDescription') || existingEvent.eventDescription;
    const eventDate = formData.get('eventDate') || existingEvent.eventDate;
    const eventTime = formData.get('eventTime') || existingEvent.eventTime;
    const performerName = formData.get('performerName') || existingEvent.performerName;
    const numberOfPasses = formData.get('numberOfPasses') || existingEvent.numberOfPasses;
    const passPrice = formData.get('passPrice') || existingEvent.passPrice;
    const eventVenue = formData.get('eventVenue') || existingEvent.eventVenue;
    const imageFile = formData.get('performerImage');

    let imagePath = existingEvent.performerImageUrl;

    if (imageFile && typeof imageFile.name === 'string') {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'Events', eventName);
      await mkdir(dir, { recursive: true });

      const fileBytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(fileBytes);
      const fileName = Date.now() + '-' + imageFile.name.replace(/\s+/g, '_');
      imagePath = `/uploads/Events/${eventName}/${fileName}`;
      await writeFile(path.join(dir, fileName), buffer);
    }

    // Update event fields
    existingEvent.eventName = eventName;
    existingEvent.eventDescription = eventDescription;
    existingEvent.eventDate = eventDate;
    existingEvent.eventTime = eventTime;
    existingEvent.performerName = performerName;
    existingEvent.numberOfPasses = numberOfPasses;
    existingEvent.passPrice = passPrice;
    existingEvent.eventVenue = eventVenue;
    existingEvent.performerImageUrl = imagePath;

    await existingEvent.save();

    return NextResponse.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Event update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
