import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';
import jwt from 'jsonwebtoken';

export async function PUT(req) {
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

    // Mark all feedback as read for this user
    await Contact.updateMany(
      { userEmail, adminResponse: { $exists: true, $ne: '' } },
      { readByUser: true }
    );

    return NextResponse.json({ 
      message: 'Responses marked as read'
    }, { status: 200 });

  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}