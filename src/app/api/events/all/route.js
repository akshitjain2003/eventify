import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find({}).sort({ createdAt: -1 }); // newest first

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching all events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
