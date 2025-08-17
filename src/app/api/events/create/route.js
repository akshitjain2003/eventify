import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Event from '@/models/event'; 
import { connectDB } from '@/lib/mongodb';
import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
  await connectDB();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const formData = await req.formData();
    const eventName = formData.get('eventName');
    const eventDescription = formData.get('eventDescription');
    const eventDate = formData.get('eventDate');
    const eventTime = formData.get('eventTime');
    const performerName = formData.get('performerName');
    const numberOfPasses = formData.get('numberOfPasses');
    const passPrice = formData.get('passPrice');
    const eventVenue = formData.get('eventVenue');
    const imageFile = formData.get('performerImage');

    let imageUrl = '';

    if (imageFile && typeof imageFile.name === 'string') {
      const fileBytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(fileBytes);

      // Convert buffer to base64 for Cloudinary
      const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

      const uploadRes = await cloudinary.uploader.upload(base64Image, {
        folder: `Events/${eventName}`, // optional folder structure
        public_id: Date.now().toString(),
      });

      imageUrl = uploadRes.secure_url; // ✅ Cloudinary hosted image
    }

    const newEvent = new Event({
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      performerName,
      numberOfPasses,
      totalPasses: numberOfPasses,
      passPrice,
      eventVenue,
      performerImageUrl: imageUrl,
      createdBy: decoded.venueId,
    });

    await newEvent.save();

    return NextResponse.json({ message: 'Event created successfully!' });
  } catch (err) {
    console.error('Event creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
