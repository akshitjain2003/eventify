import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';

export async function GET() {
  try {
    await connectDB();
    
    const allFeedback = await Contact.find({}).sort({ createdAt: -1 });
    
    console.log('Debug - Total feedback:', allFeedback.length);
    
    return NextResponse.json({ 
      total: allFeedback.length,
      feedback: allFeedback,
      sample: allFeedback.slice(0, 5)
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}