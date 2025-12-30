/**
 * @swagger
 * /api/customer/auth/resend:
 *   post:
 *     summary: Resend OTP
 *     description: Resends an OTP to the user's mobile number if the user exists.
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
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *                   example: "OTP resent"
 *                 otp:
 *                   type: string
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
// import Otp from '../../../../models/Otp';
import User from '@/models/User';
import { startOtpSchema } from '../validator/schemas';
import { generateOTP, sendOtpMock } from'@/../../src/lib/otp';

export async function POST(request: Request) {
  try {
      await connectDB();
    const body = await request.json();
    const parse = startOtpSchema.safeParse(body);
    if (!parse.success) return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    const { countryCode, mobile } = parse.data;

    let user = await User.findOne({ countryCode, mobile });
    if (!user) {
      return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });
    }
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = code;
    user.otpExpiresAt = expiresAt;
    await user.save();
    await sendOtpMock(countryCode, mobile, code);

    return NextResponse.json({
      data: {
        status: true,
        message: 'OTP resent',
        otp: code
      }
    });
  } catch (error) {
    console.log('Error in resend OTP:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
