import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';

export async function GET() {
  try {
    await connectDB();
    
    const allFeedback = await Contact.find({}).sort({ createdAt: -1 });
    
    console.log('Sample feedback with userType:', allFeedback[0]);
    
    return NextResponse.json({ 
      total: allFeedback.length,
      feedback: allFeedback.map(item => ({
        _id: item._id,
        userEmail: item.userEmail,
        userType: item.userType || 'NOT_SET',
        feedback: item.feedback,
        status: item.status,
        createdAt: item.createdAt
      }))
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

