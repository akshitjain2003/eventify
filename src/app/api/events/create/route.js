import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import Event from '@/models/event'; // your Mongoose Event model
import { connectDB } from '@/lib/mongodb';

export async function POST(req) {
  await connectDB();

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to set this secret in .env

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

    const dir = path.join(process.cwd(), 'public', 'uploads', 'Events', eventName);
    await mkdir(dir, { recursive: true });

    let imagePath = '';
    console.log(imageFile)
    if (imageFile && typeof(imageFile.name) === 'string') {
      const fileBytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(fileBytes);
      const fileName = Date.now() + '-' + imageFile.name.replace(/\s+/g, '_');
      imagePath = `/uploads/Events/${eventName}/${fileName}`;
      await writeFile(path.join(dir, fileName), buffer);
    }
    console.log(imagePath)
    console.log(imageFile)
    const newEvent = new Event({
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      performerName,
      numberOfPasses,
      passPrice,
      eventVenue,
      performerImageUrl: imagePath,
      createdBy: decoded.venueId, // ✅ Pulling from token
    });

    await newEvent.save();

    return NextResponse.json({ message: 'Event created' });
  } catch (err) {
    console.error('Event creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
