import { connectDB } from '@/lib/mongodb';
import Buyer from '@/models/buyer';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { eventId } = params;

    const buyers = await Buyer.find({ eventId }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      buyers,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
}