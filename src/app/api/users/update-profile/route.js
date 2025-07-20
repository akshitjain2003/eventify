import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { verifyToken } from "@/lib/authMiddleware";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    // Verify JWT token
    try {
      verifyToken(req);
    } catch (err) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Parse form data
    const formData = await req.formData();
    const email = formData.get("email");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const profileImage = formData.get("profileImage");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Update user data
    user.name = name || user.name;
    user.phone = phone || user.phone;

    // Upload profile image if provided
    let imageUrl = user.image;
    if (profileImage && profileImage.size > 0) {
      try {
        // Check if Cloudinary credentials are configured
        if (process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET) {

          const arrayBuffer = await profileImage.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64String = buffer.toString("base64");
          const dataURI = `data:${profileImage.type};base64,${base64String}`;

          const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: "user-profiles",
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: "auto:good" }
            ]
          });

          imageUrl = uploadResult.secure_url;
        } else {
          // For development without Cloudinary, just store a placeholder
          console.log("Cloudinary credentials not configured. Using placeholder image.");
          imageUrl = "/default-profile.png";
        }

        user.image = imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        // Continue without image upload rather than failing the whole request
        console.log("Continuing without image upload");
      }
    }

    // Save the updated user
    await user.save();

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      imageUrl
    }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({
      success: false,
      error: error.message || "Failed to update profile"
    }, { status: 500 });
  }
}
