import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Venue from "@/models/venue";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password, accountType } = await req.json();

    if (!email || !password || !accountType) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectDB();
    let account;
    
    if (accountType === 'user') {
      account = await User.findOne({ email });
    } else if (accountType === 'venue') {
      account = await Venue.findOne({ email });
    } else {
      return Response.json({ error: "Invalid account type" }, { status: 400 });
    }

    if (!account) {
      return Response.json({ error: "Account not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, account.password);
    if (!passwordMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        [accountType === 'user' ? 'userId' : 'venueId']: account._id, 
        email: account.email,
        accountType
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return appropriate data based on account type
    const responseData = {
      message: "Login successful",
      token,
      accountType
    };

    if (accountType === 'user') {
      responseData.user = {
        id: account._id,
        name: account.name,
        email: account.email,
        age: account.age,
        image: account.image
      };
    } else {
      responseData.venue = {
        id: account._id,
        venueName: account.venueName,
        email: account.email,
        contact: account.contact,
        location: account.location,
        images: account.images
      };
    }

    return Response.json(responseData, { status: 200 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error during login" }, { status: 500 });
  }
}