import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const eventId = params.eventId;
    const venueId = req.nextUrl.searchParams.get("venueId");

    if (!eventId || !venueId) {
      return NextResponse.json({ error: "Event ID and Venue ID are required" }, { status: 400 });
    }

    // Find the event and ensure it belongs to the venue
    const event = await Event.findOne({ _id: eventId, createdBy: venueId });

    if (!event) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
    }

    await Event.deleteOne({ _id: eventId });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
