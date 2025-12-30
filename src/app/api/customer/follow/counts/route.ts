/**
 * @swagger
 * /api/customer/follow/counts:
 *   get:
 *     summary: Get followers and following counts
 *     description: Retrieves the number of followers and following for a user by userId.
 *     tags:
 *       - Follow
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Counts fetched successfully
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
 *                   example: "Counts fetched"
 *                 followers:
 *                   type: integer
 *                 following:
 *                   type: integer
 */
// Followers & following count API
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';

export async function GET(req: NextRequest) {
  try {
    // JWT and authorization header removed: public access
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ data: { status: false, message: 'userId required' } }, { status: 400 });
    // Validate userId is a valid MongoDB ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ data: { status: false, message: 'Invalid userId format' } }, { status: 400 });
    }
    try {
      const followers = await Follow.countDocuments({ following: userId, status: 'accepted', isDeleted: false });
      const following = await Follow.countDocuments({ follower: userId, status: 'accepted', isDeleted: false });
      return NextResponse.json({ data: { status: true, message: 'Counts fetched', followers, following } });
    } catch (err: any) {
      return NextResponse.json({ data: { status: false, message: 'Server error', error: err?.message || err } }, { status: 500 });
    }
  } catch (error) {
    console.log('Error in follow counts:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
