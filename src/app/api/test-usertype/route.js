import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/contact';

export async function GET() {
  try {
    await connectDB();
    
    // Get the first feedback entry and convert to plain object
    const firstFeedback = await Contact.findOne({}).lean();
    
    if (firstFeedback) {
      // Update with userType using updateOne
      await Contact.updateOne(
        { _id: firstFeedback._id },
        { $set: { userType: 'user' } }
      );
      
      // Fetch the updated record
      const updatedRecord = await Contact.findById(firstFeedback._id).lean();
      
      return NextResponse.json({ 
        message: 'Added userType to first record',
        record: updatedRecord,
        allFields: Object.keys(updatedRecord)
      });
    }
    
    return NextResponse.json({ message: 'No feedback found' });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
