import { connectDB } from "@/lib/mongodb";
import Buyer from "@/models/buyer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    const allBuyers = await Buyer.find({});
    console.log('All buyers in database:', allBuyers);
    
    return NextResponse.json({
      count: allBuyers.length,
      buyers: allBuyers.map(b => ({
        id: b._id,
        name: b.name,
        userId: b.userId,
        userIdType: typeof b.userId,
        eventName: b.eventName
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}