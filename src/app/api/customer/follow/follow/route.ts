/**
 * @swagger
 * /api/customer/follow/follow:
 *   post:
 *     summary: Follow or unfollow a user
 *     description: Allows a user to follow or unfollow another user.
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
 *               action:
 *                 type: string
 *                 enum: ["1", "0"]
 *                 example: "1"
 *                 description: "1 = follow, 0 = unfollow"
 *     responses:
 *       200:
 *         description: Follow/unfollow action successful
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
 *                   example: "Followed user"
 */
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';
import User from '@/models/User';
import { z } from 'zod';

// Validation for follow/unfollow action: 1 for follow, 0 for unfollow
const followActionSchema = z.object({
  userId: z.string().min(1),
  targetUserId: z.string().min(1),
  action: z.enum(["1", "0"]), // 1 for follow, 0 for unfollow
});

export async function POST(req: NextRequest) {
  try {
    // JWT is disabled, get userId from request body
    await connectDB();
    const body = await req.json();
    const parse = followActionSchema.safeParse(body);
    if (!parse.success) return NextResponse.json({
      data: {
        status: false,
        message: 'Validation error',
        errors: parse.error.issues
      }
    }, { status: 400 });
    const { userId, targetUserId, action } = parse.data;
    if (!userId) return NextResponse.json({
      data: {
        status: false,
        message: 'userId is required in request body'
      }
    }, { status: 400 });
    if (userId === targetUserId) return NextResponse.json({
      data: {
        status: false,
        message: 'Cannot follow yourself'
      }
    }, { status: 400 });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return NextResponse.json({
      data: {
        status: false,
        message: 'Target user not found'
      }
    }, { status: 404 });
    if (targetUser.blockedUsers?.includes(userId)) return NextResponse.json({
      data: {
        status: false,
        message: 'You are blocked by this user'
      }
    }, { status: 403 });

    if (action === "0") {
      // Unfollow
      let follow = await Follow.findOne({
        follower: userId,
        following: targetUserId,
      });
      if (follow) {
        follow.isDeleted = true;
        await follow.save();
        return NextResponse.json({ data: { status: true, message: 'Unfollowed' } });
      } else {
        return NextResponse.json({ data: { status: false, message: 'Not following' } });
      }
    } else if (action === "1") {
      // Follow
      let follow = await Follow.findOne({
        follower: userId,
        following: targetUserId,
      });
      if (follow) {
        return NextResponse.json({ data: { status: false, message: 'Already following' } });
      }
      const status = targetUser.profileType === 'private' ? 'pending' : 'accepted';
      follow = await Follow.create({ follower: userId, following: targetUserId, status });
      return NextResponse.json({
        data: {
          status: true,
          message: status === 'pending' ? 'Follow request sent' : 'Followed'
        }
      });
    } else {
      return NextResponse.json({ data: { status: false, message: 'Invalid action' } }, { status: 400 });
    }
  } catch (error) {
    console.log('Error in follow/unfollow:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}

