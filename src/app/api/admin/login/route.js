import jwt from 'jsonwebtoken';

// Fixed admin credentials
const ADMIN_CREDENTIALS = {
  adminId: 'superadmin2024',
  password: 'Admin@123456'
};

export async function POST(req) {
  try {
    const { adminId, password } = await req.json();

    if (!adminId || !password) {
      return Response.json({ error: "Admin ID and password are required" }, { status: 400 });
    }

    // Check fixed credentials
    if (adminId !== ADMIN_CREDENTIALS.adminId || password !== ADMIN_CREDENTIALS.password) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    // Create JWT token for admin
    const token = jwt.sign(
      { 
        adminId: adminId,
        role: 'superadmin',
        loginTime: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return Response.json({ 
      message: "Admin login successful",
      token,
      admin: {
        id: adminId,
        role: 'superadmin'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}