/**
 * @swagger
 * /api/customer/follow/blocked:
 *   patch:
 *     summary: Block or unblock a user
 *     description: Allows a user to block or unblock another user by their IDs.
 *     tags:
 *       - Follow
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
 *               targetUserId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *               block:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User blocked or unblocked successfully
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
 *                   example: "User blocked"
 */
// Block/unblock user API
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: NextRequest) {
  try {
    // JWT and authorization header removed: public access
    await connectDB();
    const body = await req.json();
    const { userId, targetUserId, block } = body;
    if (!userId || !targetUserId || typeof block !== 'boolean') {
      return NextResponse.json({ data: { status: false, message: 'userId, targetUserId, and block required' } }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });
    user.blockedUsers = user.blockedUsers || [];
    if (block) {
      if (!user.blockedUsers.includes(targetUserId)) user.blockedUsers.push(targetUserId);
    } else {
      user.blockedUsers = user.blockedUsers.filter((id: string) => id !== targetUserId);
    }
    await user.save();
    return NextResponse.json({ data: { status: true, message: block ? 'User blocked' : 'User unblocked' } });
  } catch (error) {
    console.log('Error in block/unblock user:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
