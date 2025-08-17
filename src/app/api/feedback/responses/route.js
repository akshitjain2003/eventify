import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // Verify token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    // Fetch feedback for this user/venue
    const feedback = await Contact.find({ userEmail }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      feedback
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch responses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}