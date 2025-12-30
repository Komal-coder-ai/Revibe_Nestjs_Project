/**
 * @swagger
 * /api/customer/user/updateProfile:
 *   patch:
 *     summary: Update user profile
 *     description: Updates the user's profile information. Checks for uniqueness and updates the user profile.
 *     tags:
 *       - User
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 userId:
 *                   type: string
 *                 aadharEntered:
 *                   type: boolean
 *                 profileCompleted:
 *                   type: boolean
 */

import { NextResponse } from 'next/server';
// JWT import removed
import connectDB from '@/lib/db';
import User from '@/models/User';
import { updateUserProfileSchema } from '../validator/schemas';

// PATCH /api/user/updateProfile
export async function PATCH(req: Request) {
  try {
    // JWT and authorization header removed: public access
    await connectDB();
    const body = await req.json();

    const { userId, name, mobile, countryCode, username, email, bio, profileImage, coverImage } = body;
    if (!userId) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'userId required'
        }
      },
      { status: 400 });

    // Check for unique username if provided
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json(
          {
            data:
            {
              status: false,
              message: 'Username already taken'
            }
          }, { status: 409 });
      }
    }
    // Check for unique email if provided
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return NextResponse.json(
          {
            data:
            {
              status: false,
              message: 'Email already in use'
            }
          }, { status: 409 });
      }
    }

    // check for unique mobile if provided
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
    if (mobile) update.mobile = mobile;
    if (countryCode) update.countryCode = countryCode;
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

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });

    const userObj = user.toObject ? user.toObject() : user;
    userObj.userId = userObj._id?.toString?.() ?? userObj._id;
    delete userObj._id;

    // Ensure all new fields are present in the response
    userObj.refreshToken = userObj.refreshToken || { token: '', expiresAt: null };
    userObj.otp = userObj.otp || '';
    userObj.otpExpiresAt = userObj.otpExpiresAt || null;
    return NextResponse.json({
      data: {
        status: true,
        message: 'Profile updated',
        user: userObj
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
