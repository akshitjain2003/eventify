import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();

    // Update records based on email patterns
    // Set venue type for sunmooncafe@gmail.com
    const venueResult = await Contact.updateMany(
      { userEmail: "sunmooncafe@gmail.com" },
      { $set: { userType: 'venue' } }
    );

    // Set user type for all other emails
    const userResult = await Contact.updateMany(
      { userEmail: { $ne: "sunmooncafe@gmail.com" } },
      { $set: { userType: 'user' } }
    );

    return NextResponse.json({ 
      message: 'Migration completed',
      venueUpdated: venueResult.modifiedCount,
      userUpdated: userResult.modifiedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

