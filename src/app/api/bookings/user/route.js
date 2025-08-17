import { connectDB } from "@/lib/mongodb";
import Buyer from "@/models/buyer";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token fields:', Object.keys(decoded)); // Debug log
    
    const userId = decoded.userId || decoded.id;
    console.log('Searching for userId:', userId); // Debug log

    // Check what's actually in the database
    const allBuyers = await Buyer.find({});
    console.log('All buyers with their userIds:', allBuyers.map(b => ({ 
      name: b.name, 
      userId: b.userId, 
      userIdType: typeof b.userId 
    })));

    const bookings = await Buyer.find({ userId: userId }).sort({ createdAt: -1 });
    console.log('Found bookings:', bookings.length);

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}


