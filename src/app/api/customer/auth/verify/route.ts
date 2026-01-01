/**
 * @swagger
 * /api/customer/auth/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP for the user's mobile number and issues access and refresh tokens.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               mobile:
 *                 type: string
 *                 example: "9039418742"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: "OTP verified"
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 userId:
 *                   type: string
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextRequest } from 'next/server';
import { verifyOtpSchema } from '../validator/schemas';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parse = verifyOtpSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Validation error',
          errors: parse.error.issues
        }
      }, { status: 400 });
    }

    const { countryCode, mobile, otp } = parse.data;
    const user = await User.findOne({ countryCode, mobile });
    if (!user) {
      console.log('DEBUG: User not found', { countryCode, mobile });
      return NextResponse.json({
        data: {
          status: false,
          message: 'User not found'
        }
      }, { status: 404 });
    }
    if (user && !user.isActive) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'User is not active please contact support to activate your account',
          }
        },
        { status: 403 }
      );
    }
    console.log('DEBUG: User found', {
      otpFromUser: otp,
      userOtp: user.otp,
      userOtpExpiresAt: user.otpExpiresAt,
      now: new Date()
    });
    if (!user.otp || !user.otpExpiresAt || user.otp !== otp) {
      console.log('DEBUG: OTP mismatch or missing',
        { userOtp: user.otp, userOtpExpiresAt: user.otpExpiresAt, otpFromUser: otp });
      return NextResponse.json({
        data: {
          status: false,
          message: 'Invalid or expired OTP'
        }
      }, { status: 400 });
    }
    if (user.otpExpiresAt < new Date()) {
      console.log('DEBUG: OTP expired',
        { userOtpExpiresAt: user.otpExpiresAt, now: new Date() });
      return NextResponse.json({
        data: {
          status: false,
          message: 'OTP expired'
        }
      }, { status: 400 });
    }
    user.otp = '';
    user.otpExpiresAt = null;
    user.isVerified = true;
    const access = signAccessToken({ sub: user._id.toString(), mobile });
    const refresh = signRefreshToken({ sub: user._id.toString() });
    user.refreshToken = refresh;
    await user.save();

    const aadharEntered = Boolean(user.aadhar && user.aadhar.length > 0);
    const profileCompleted = Boolean(user.username && user.profileImage);
    return NextResponse.json({
      data: {
        status: true,
        message: 'OTP verified',
        accessToken: access,
        refreshToken: refresh,
        userId: user._id?.toString?.() ?? user._id,
        aadharEntered,
        profileCompleted
      }
    });
  } catch (error) {
    console.log('Error in verify OTP:', error);
    return NextResponse.json({ data: { status: false, message: 'Server error' } }, { status: 500 });
  }
}

