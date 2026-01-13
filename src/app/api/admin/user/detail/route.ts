import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Follow from '@/models/Follow';
import Post from '@/models/Post';
/**
 * @swagger
 * /api/admin/user/detail:
 *   get:
 *     summary: Get user details by ID
 *     description: Fetch complete user profile information including all fields from database
 *     tags:
 *       - Admin Users
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to fetch
 *         example: "69536f3e1ca7e6daa044ea10"
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     countryCode:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                     profileType:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     status:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Bad request - userId required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user by ID
    const user = await User.findById(userId).lean() as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    const [followers, followings, postCount] = await Promise.all([
      Follow.countDocuments({ following: userId, status: 'accepted', isDeleted: false }),
      Follow.countDocuments({ follower: userId, status: 'accepted', isDeleted: false }),
      Post.countDocuments({ user: userId, isDeleted: false })
    ]);

    // Format user data
    const formattedUser = {
      id: user._id?.toString(),
      username: user.username || 'N/A',
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      mobile: user.mobile || 'N/A',
      countryCode: user.countryCode || '+91',
      bio: user.bio || '',
      aadhar: user.aadhar || '',
      profileImage: user.profileImage?.[0]?.imageUrl || '',
      coverImage: user.coverImage?.[0]?.imageUrl || '',
      profileType: user.profileType || 'public',
      isVerified: user.isVerified || false,
      isActive: user.isActive,
      status: user.status !== undefined ? user.status : (user.isVerified ? 1 : 0),
      userType: user.userType || 'original',
      referralCode: user.referralCode || '',
      createdAt: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      updatedAt: user.updatedAt,
      followersCount: followers,
      followingCount: followings,
      postCount: postCount,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User details fetched successfully',
        data: formattedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user details',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
