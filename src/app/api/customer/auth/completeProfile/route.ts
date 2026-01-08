/**
 * @swagger
 * /api/customer/auth/completeProfile:
 *   post:
 *     summary: Complete user profile
 *     description: Validates and updates the user's profile information. Checks for uniqueness and updates the user profile.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               name:
 *                 type: string
 *                 example: "Rajesh Kumar"
 *               username:
 *                 type: string
 *                 example: "rajesh123"
 *               email:
 *                 type: string
 *                 example: "rajesh@example.com"
 *               bio:
 *                 type: string
 *                 example: "Hello, I am Rajesh."
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               countryCode:
 *                 type: string
 *                 example: "+91"
 *               profileImage:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     thumbUrl:
 *                       type: string
 *                     type:
 *                       type: string
 *                     width:
 *                       type: string
 *                     height:
 *                       type: string
 *                     orientation:
 *                       type: string
 *                     format:
 *                       type: string
 *               coverImage:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     thumbUrl:
 *                       type: string
 *                     type:
 *                       type: string
 *                     width:
 *                       type: string
 *                     height:
 *                       type: string
 *                     orientation:
 *                       type: string
 *                     format:
 *                       type: string
 *               referralCode:
 *                 type: string
 *                 example: "REF12345"
 *     responses:
 *       200:
 *         description: Profile completed successfully
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
 *                   example: "Profile completed successfully"
 *                 userId:
 *                   type: string
 *                 aadharEntered:
 *                   type: boolean
 *                 profileCompleted:
 *                   type: boolean
                    type: string
 */
// Swagger documentation for this endpoint
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { NextRequest } from 'next/server';
import { completeProfileSchema } from '@/app/api/customer/auth/validator/schemas';

// ...existing code...

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parse = completeProfileSchema.safeParse(body);
    if (!parse.success) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'Validation error',
          errors: parse.error.issues
        }
      }, { status: 400 });
    const { userId, name, username, email, bio, profileImage, coverImage, mobile, countryCode, referralCode } = parse.data;

    // Validate referralCode if provided and record referral
    let referredBy = null;
    if (referralCode) {
      // Find user with this referralCode
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return NextResponse.json({ data: { status: false, message: 'Invalid referral code' } },
          { status: 400 });
      }
      referredBy = referrer._id;
      // Check if referral already exists
      const existingReferral = await Referral.findOne({ referredBy: referrer._id, referredUser: userId });
      if (!existingReferral) {
        await Referral.create({ referredBy: referrer._id, referredUser: userId });
      }
    }

    // Check for unique username if provided
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json({ data: { status: false, message: 'Username already taken' } }, { status: 409 });
      }
    }
    // Check for unique email if provided
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json({ data: { status: false, message: 'Email already in use' } }, { status: 409 });
      }
    }
    // Check for unique mobile + countryCode if provided
    if (mobile && countryCode) {
      const existing = await User.findOne({ mobile, countryCode, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json(
          {
            data:
            {
              status: false,
              message: 'Mobile number already in use'
            }
          }, { status: 409 });
      }
    }


    const update: any = {};
    if (name) update.name = name;
    if (username) update.username = username;
    if (email) update.email = email;
    if (bio) update.bio = bio;
    if (profileImage) {
      if (typeof profileImage === 'string') {
        try {
          update.profileImage = JSON.parse(profileImage);
        } catch {
          update.profileImage = [];
        }
      } else {
        update.profileImage = profileImage;
      }
    }
    if (coverImage) {
      if (typeof coverImage === 'string') {
        try {
          update.coverImage = JSON.parse(coverImage);
        } catch {
          update.coverImage = [];
        }
      } else {
        update.coverImage = coverImage;
      }
    }
    if (mobile) update.mobile = mobile;
    if (countryCode) update.countryCode = countryCode;
    if (referralCode) update.referralCode = referralCode;
    if (referredBy) update.referredBy = referredBy;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });

    const aadharEntered = Boolean(user.aadhar && user.aadhar.length > 0);
    const profileCompleted = Boolean(user.username && user.profileImage && user.profileImage.length > 0);
    return NextResponse.json({
      data: {
        status: true,
        message: 'Profile completed successfully',
        userId: user._id?.toString?.() ?? user._id,
        aadharEntered,
        profileCompleted,

      }
    });
  } catch (error) {
    console.log('Error in complete profile:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });

  }
}
