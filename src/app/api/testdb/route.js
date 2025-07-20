import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";


export async function GET(req) {
  try {
    await connectDB();



    const users = await User.find({}, "-password"); // exclude password field
    return Response.json(users);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
