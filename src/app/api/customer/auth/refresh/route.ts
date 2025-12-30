/**
 * @swagger
 * /api/customer/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Issues a new access token using a valid refresh token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
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
 *                   example: "Access token refreshed"
 *                 accessToken:
 *                   type: string

 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextRequest } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { refreshToken } = body as { refreshToken?: string };
    if (!refreshToken) return NextResponse.json({ data: { status: false, message: 'refreshToken required' } }, { status: 400 });


    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) return NextResponse.json({ data: { status: false, message: 'Invalid refresh token' } }, { status: 401 });

    try {
      const payload: any = verifyRefreshToken(refreshToken) as any;
      // Already have user from above
      const access = signAccessToken({ sub: user._id.toString(), mobile: user.mobile });
      return NextResponse.json({ data: { status: true, message: 'Access token refreshed', accessToken: access, refreshToken } });
    } catch (e) {
      return NextResponse.json({ data: { status: false, message: 'Invalid token' } }, { status: 401 });
    }
  } catch (error) {
    console.log('Error in refresh token:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
