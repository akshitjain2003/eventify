import { connectDB } from "@/lib/mongodb";
import Event from "@/models/event";
import { verifyToken } from "@/lib/authMiddleware";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Needed for file system and formData()

export async function POST(req) {
  try {
    // ✅ 1. Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ✅ 2. Parse form data
    const formData = await req.formData();
    const eventName = formData.get("eventName");
    const eventDescription = formData.get("eventDescription");
    const eventDate = formData.get("eventDate");
    const eventTime = formData.get("eventTime");
    const performerName = formData.get("performerName");
    const numberOfPasses = parseInt(formData.get("numberOfPasses"));
    const passPrice = parseFloat(formData.get("passPrice"));
    const eventVenue = formData.get("eventVenue");
    const createdBy = formData.get("createdBy"); // from hidden input or frontend

    const imageFile = formData.get("performerImage");

    if (!eventName || !eventDescription || !eventDate || !eventTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ 3. Handle image saving to `/public/uploads/Events/[EventName]/`
    let imageUrl = "/default-event.png";
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = imageFile.name?.split(".").pop() || "jpg";

      const folderPath = path.join(process.cwd(), "public", "uploads", "Events", eventName);
      const fileName = `performer-${Date.now()}.${ext}`;
      const filePath = path.join(folderPath, fileName);

      await mkdir(folderPath, { recursive: true });
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/Events/${eventName}/${fileName}`;
    }

    // ✅ 4. Save event to DB
    const newEvent = await Event.create({
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      performerName,
      numberOfPasses,
      passPrice,
      eventVenue,
      performerImageUrl: imageUrl,
      createdBy,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create event",
      },
      { status: 500 }
    );
  }
}
