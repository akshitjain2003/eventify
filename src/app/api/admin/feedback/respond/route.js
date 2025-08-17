import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';
import jwt from 'jsonwebtoken';

export async function PUT(req) {
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

    const { feedbackId, adminResponse, status } = await req.json();

    if (!feedbackId || !adminResponse) {
      return NextResponse.json({ error: 'Feedback ID and response are required' }, { status: 400 });
    }

    // Update feedback with admin response
    const updatedFeedback = await Contact.findByIdAndUpdate(
      feedbackId,
      { 
        adminResponse,
        status: status || 'reviewed'
      },
      { new: true }
    );

    if (!updatedFeedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Response sent successfully',
      feedback: updatedFeedback
    }, { status: 200 });

  } catch (error) {
    console.error('Respond to feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}