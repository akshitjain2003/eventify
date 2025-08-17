import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Event from '@/models/event';
import { connectDB } from '@/lib/mongodb';
import cloudinary from '@/lib/cloudinary';

export async function PUT(req, { params }) {
  await connectDB();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formData = await req.formData();

    const eventId = params.id;
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

    let imageUrl = existingEvent.performerImageUrl;

    // ✅ Upload new image to Cloudinary if provided
    if (imageFile && typeof imageFile.name === 'string') {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      const uploadFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `Events/${eventName}` },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(buffer);
        });
      };

      const uploadRes = await uploadFromBuffer(buffer);
      imageUrl = uploadRes.secure_url;

      // ✅ Optional: delete old image from Cloudinary (if exists)
      if (existingEvent.performerImageUrl) {
        try {
          const publicId = existingEvent.performerImageUrl
            .split('/')
            .slice(-2)
            .join('/')
            .split('.')[0]; // Extract Cloudinary public_id
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn('Failed to delete old image:', err.message);
        }
      }
    }

    // ✅ Update event fields
    existingEvent.eventName = eventName;
    existingEvent.eventDescription = eventDescription;
    existingEvent.eventDate = eventDate;
    existingEvent.eventTime = eventTime;
    existingEvent.performerName = performerName;
    existingEvent.numberOfPasses = numberOfPasses;
    existingEvent.passPrice = passPrice;
    existingEvent.eventVenue = eventVenue;
    existingEvent.performerImageUrl = imageUrl;

    await existingEvent.save();

    return NextResponse.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Event update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
