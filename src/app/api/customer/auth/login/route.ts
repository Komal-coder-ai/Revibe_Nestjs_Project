/**
 * @swagger
 * /api/customer/auth/login:
 *   post:
 *     summary: Start OTP login flow
 *     description: Initiates login by sending an OTP to the user's mobile number. Creates user if not found.
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
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP sent"
 *                 otp:
 *                   type: string
 *       
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextRequest } from 'next/server';
// import Otp from '../../../../models/Otp';
import { startOtpSchema } from '../validator/schemas';
import { generateOTP, sendOtpMock } from '@/../../src/lib/otp';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parse = startOtpSchema.safeParse(body);
    if (!parse.success) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'Validation error',
          errors: parse.error.issues
        }
      },
      { status: 400 });

    const { countryCode, mobile } = parse.data;

    let user = await User.findOne({ countryCode, mobile });

    if (user && !user.isActive) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'User is not active please contact support',
          }
        },
        { status: 403 }
      );
    }

    if (!user) {
      // Generate 10-digit hexadecimal referral code
      const referralCode = Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      // Defensive: ensure profileImage is always an array if provided as a string
      let userData: any = { countryCode, mobile, referralCode };
      if (typeof userData.profileImage === 'string') {
        userData.profileImage = [{ imageUrl: userData.profileImage }];
      }
      user = await User.create(userData);
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = code;
    user.otpExpiresAt = expiresAt;
    await user.save();
    console.log('DEBUG: OTP set on user', { userId: user._id, otp: user.otp, otpExpiresAt: user.otpExpiresAt });
    await sendOtpMock(countryCode, mobile, code);

    return NextResponse.json({
      data: {
        status: true,
        message: 'OTP sent',
        otp: code
      }
    });
  } catch (error) {
    console.log('Error in start OTP flow:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
