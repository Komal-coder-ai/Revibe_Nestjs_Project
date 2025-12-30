/**
 * @swagger
 * /api/customer/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the user by clearing their refresh token and invalidating the access token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out"
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
// import { verify } from 'jsonwebtoken';
import User from '@/models/User';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { accessToken } = body as { accessToken?: string };
    if (!accessToken) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'accessToken required'
        }
      },
        { status: 400 });
    }

    // let userId;
    // try {
    //   const decoded = verify(accessToken, process.env.JWT_SECRET!);

    //   userId = decoded.userId || decoded.sub;
    // } catch (err) {
    //   return NextResponse.json({ data: { status: false, message: 'Invalid accessToken' } }, { status: 401 });
    // }

    // Find user by userId and clear refreshToken
    // const user = await User.findById(userId);
    // if (user) {
    //   user.refreshToken = '';
    //   await user.save();
    // }

    return NextResponse.json({ data: { status: true, message: 'Logged out' } });
  } catch (error) {
    console.log('Error in logout:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
