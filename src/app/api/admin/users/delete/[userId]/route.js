import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import jwt from 'jsonwebtoken';

export async function DELETE(req, { params }) {
  try {
    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'superadmin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (err) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { userId } = params;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return Response.json({ 
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: userId,
        name: user.name,
        email: user.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
}