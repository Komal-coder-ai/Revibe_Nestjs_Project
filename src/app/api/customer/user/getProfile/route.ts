/**
 * @swagger
 * /api/customer/user/getProfile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the user's profile information by userId.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: targetUserId
 *         required: true
 *         description: The user ID of the profile to fetch.
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: userId
 *         required: true
 *         description: The user ID of the requester (client must provide this since there is no authentication).
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                   example: "User profile fetched"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     countryCode:
 *                       type: string
 *                     profileImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                     coverImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                     followersCount:
 *                       type: number
 *                     followingsCount:
 *                       type: number
 *       400:
 *         description: Missing userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSingleFollowStatus } from '@/common/getFollowStatusMap';

// GET /api/user/get-profile?userId=...&targetUserId=...
export async function GET(req: Request) {
  try {
    // JWT and authorization header removed: public access
    await connectDB();
    const { searchParams } = new URL(req.url!);
    const userId = searchParams.get('userId'); // requester
    const targetUserId = searchParams.get('targetUserId'); // profile to fetch
    if (!userId || !targetUserId) {
      return NextResponse.json({ data: { status: false, message: 'userId and targetUserId required' } }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });


    // Get followers, followings, and post count
    const Follow = (await import('@/models/Follow')).default;
    const Post = (await import('@/models/Post')).default;
    const [followers, followings, postCount] = await Promise.all([
      Follow.countDocuments({ following: targetUserId, status: 'accepted', isDeleted: false }),
      Follow.countDocuments({ follower: targetUserId, status: 'accepted', isDeleted: false }),
      Post.countDocuments({ userId: targetUserId, isDeleted: false })
    ]);


    let profile;
    const raw = targetUser.toObject ? targetUser.toObject() : targetUser;
    if (userId === targetUserId) {
      // Return full profile for self
      profile = {
        userId: raw._id?.toString?.() ?? raw._id,
        countryCode: raw.countryCode || '',
        mobile: raw.mobile || '',
        aadhar: raw.aadhar || '',
        username: raw.username || '',
        name: raw.name || '',
        email: raw.email || '',
        bio: raw.bio || '',
        profileImage: raw.profileImage || '',
        coverImage: raw.coverImage || '',
        isVerified: !!raw.isVerified,
        isLoggedInUser: true,
        userType: raw.userType || '',
        followers,
        followings,
        postCount
      };
    } else {
      // Return public profile for others
      const followStatusCode = await getSingleFollowStatus(userId, targetUserId);
      profile = {
        userId: raw._id?.toString?.() ?? raw._id,
        username: raw.username || '',
        name: raw.name || '',
        bio: raw.bio || '',
        profileImage: raw.profileImage || '',
        coverImage: raw.coverImage || '',
        isLoggedInUser: false,
        followers,
        followings,
        postCount,
        followStatusCode
      };
    }
    return NextResponse.json({ data: { status: true, message: 'Profile fetched', user: profile } });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
