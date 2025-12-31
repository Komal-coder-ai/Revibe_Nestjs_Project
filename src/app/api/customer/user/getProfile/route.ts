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
 *         name: userId
 *         required: true
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
// import { verifyAccessToken } from '../../../../lib/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET /api/user/get-profile?userId=...
export async function GET(req: Request) {
  try {
    // JWT and authorization header removed: public access
    await connectDB();
    const { searchParams } = new URL(req.url!);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ data: { status: false, message: 'userId required' } }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });

    // Get followers and followings count
    const Follow = (await import('@/models/Follow')).default;
    const [followers, followings] = await Promise.all([
      Follow.countDocuments({ following: userId, status: 'accepted', isDeleted: false }),
      Follow.countDocuments({ follower: userId, status: 'accepted', isDeleted: false })
    ]);


    const raw = user.toObject ? user.toObject() : user;
    const profile = {
      userId: raw._id?.toString?.() ?? raw._id,
      countryCode: raw.countryCode || '',
      mobile: raw.mobile || '',
      aadhar: raw.aadhar || '',
      username: raw.username || '',
      email: raw.email || '',
      bio: raw.bio || '',
      profileImage: raw.profileImage || '',
      coverImage: raw.coverImage || '',
      isVerified: !!raw.isVerified,
      userType: raw.userType || '',
      followers,
      followings
    };
    // console.log(profile);
    
    return NextResponse.json({ data: { status: true, message: 'Profile fetched', user: profile } });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
