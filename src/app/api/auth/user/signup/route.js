import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { promises as fs } from 'fs';
import path from 'path';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().min(13).max(120),
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email").toLowerCase();
    const password = formData.get("password");
    const age = formData.get("age");

    const result = schema.safeParse({ 
      name, 
      email, 
      password, 
      age: Number(age) 
    });
    
    if (!result.success) {
      return Response.json({ error: "Invalid or missing fields" }, { status: 400 });
    }

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      isVerified: true,
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({ 
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error creating user" }, { status: 500 });
  }
}