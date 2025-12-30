import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import * as bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login endpoint
 *     description: Authenticates admin user and creates account if it doesn't exist
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account is inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded authentication (for testing/development)
    const HARDCODED_ADMIN = {
      email: 'komalp@mailinator.com',
      password: 'Komal@123',
      name: 'Komal P',
      countryCode: '+91',
      mobile: '',
      role: 'admin',
      isActive: true,
      id: 'hardcoded-admin-001'
    };

    // Check hardcoded credentials first
    if (email.toLowerCase() === HARDCODED_ADMIN.email && password === HARDCODED_ADMIN.password) {
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            id: HARDCODED_ADMIN.id,
            name: HARDCODED_ADMIN.name,
            email: HARDCODED_ADMIN.email,
            countryCode: HARDCODED_ADMIN.countryCode,
            mobile: HARDCODED_ADMIN.mobile,
            role: HARDCODED_ADMIN.role,
            isActive: HARDCODED_ADMIN.isActive
          }
        },
        { status: 200 }
      );
    }

    // If hardcoded credentials don't match, try database authentication with upsert
    try {
      // Connect to database
      await connectDB();

      // Find admin by email
      let admin = await Admin.findOne({ email: email.toLowerCase() });

      if (!admin) {
        // Admin doesn't exist, create new admin with provided credentials
        console.log('Admin not found, creating new admin...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new admin with all fields
        admin = await Admin.create({
          name: email.split('@')[0], // Use email prefix as name
          email: email.toLowerCase(),
          password: hashedPassword,
          countryCode: '',
          mobile: '',
          role: 'admin',
          isActive: true,
          otp: '',
          refreshToken: ''
        });

        console.log('New admin created:', admin.email);

        // Return success response for newly created admin
        return NextResponse.json(
          {
            success: true,
            message: 'Admin account created and login successful',
            data: {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              countryCode: admin.countryCode,
              mobile: admin.mobile,
              role: admin.role,
              isActive: admin.isActive
            }
          },
          { status: 200 }
        );
      }

      // Admin exists, check if active
      if (!admin.isActive) {
        return NextResponse.json(
          { success: false, message: 'Admin account is inactive' },
          { status: 403 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Return success response with all admin data (without password and sensitive fields)
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            countryCode: admin.countryCode,
            mobile: admin.mobile,
            role: admin.role,
            isActive: admin.isActive
          }
        },
        { status: 200 }
      );
    } catch (dbError: any) {
      console.error('Database authentication error:', dbError);
      // If database fails, return generic error
      return NextResponse.json(
        { success: false, message: 'Database error occurred', error: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
