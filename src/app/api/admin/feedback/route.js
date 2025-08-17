import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'superadmin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get userType from query params
    const url = new URL(req.url);
    const userType = url.searchParams.get('userType');

    // Build filter
    const filter = {};
    if (userType === 'user') {
      filter.userType = 'user';
    } else if (userType === 'venue') {
      filter.userType = 'venue';
    }

    // Fetch feedback based on filter
    const feedback = await Contact.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ 
      feedback,
      count: feedback.length 
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}









