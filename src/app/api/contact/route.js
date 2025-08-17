import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';

export async function POST(request) {
    try {
        await connectDB();
        
        const { id, feedback, userType } = await request.json();

        // Validate input
        if (!id || !feedback) {
            return NextResponse.json(
                { error: 'ID and feedback are required' },
                { status: 400 }
            );
        }

        if (feedback.length < 10) {
            return NextResponse.json(
                { error: 'Feedback must be at least 10 characters' },
                { status: 400 }
            );
        }

        // Save to database
        const newContact = await Contact.create({
            userId: id,
            userEmail: id,
            userType: userType || 'user',
            feedback: feedback,
            status: 'pending'
        });

        console.log('Feedback saved with userType:', userType || 'user');

        return NextResponse.json(
            { message: 'Feedback submitted successfully!' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        );
    }
}




