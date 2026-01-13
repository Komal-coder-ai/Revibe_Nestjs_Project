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
import NotificationSettings from '@/models/NotificationSettings';
import { checkAndHandleLockout, handleFailedLogin } from '@/lib/authUtils';

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
      let userData: any = { countryCode, mobile, referralCode };
      if (typeof userData.profileImage === 'string') {
        userData.profileImage = [{ imageUrl: userData.profileImage }];
      }
      user = await User.create(userData);
    }


    // Check lockout status
    // const lockout = await checkAndHandleLockout(user);
    // if (lockout.locked) {
    //   return NextResponse.json({
    //     data: {
    //       status: false,
    //       message: lockout.message
    //     }
    //   }, { status: 429 });
    // }

    // Simulate login failure for demonstration (replace with your actual login validation)
    // If login fails:
    // await handleFailedLogin(user);
    // return NextResponse.json({ data: { status: false, message: 'Invalid credentials' } }, { status: 401 });

    // If login succeeds:
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = code;
    user.otpExpiresAt = expiresAt;
    await user.save();
    // console.log('DEBUG: OTP set on user', { userId: user._id, otp: user.otp, otpExpiresAt: user.otpExpiresAt });
    // await sendOtpMock(countryCode, mobile, code);
    // await handleFailedLogin(user);


// ******************** move this later when user create profile *********************
    await NotificationSettings.findOneAndUpdate(
      { userId: user._id },
      {},
      { upsert: true, new: true }
    ); // Create default notification settings
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
