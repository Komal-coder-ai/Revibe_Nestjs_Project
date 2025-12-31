/**
 * @openapi
 * /api/customer/block/blockOrUnblock:
 *   post:
 *     summary: Block or unblock a user
 *     description: Block a user (block=1) or unblock a user (block=0) by userId and targetUserId. Unblock performs a soft delete (sets isDeleted=true).
 *     tags:
 *       - Block
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user performing the action
 *               targetUserId:
 *                 type: string
 *                 description: The ID of the user to be blocked or unblocked
 *               block:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 1 to block, 0 to unblock
 *             required:
 *               - userId
 *               - targetUserId
 *               - block
 *     responses:
 *       200:
 *         description: Block or unblock result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 action:
 *                   type: string
 *                   description: blocked or unblocked
 *                 blocked:
 *                   type: object
 *                   nullable: true
 *                   description: Blocked user object (for block action)
 *                 softDeleted:
 *                   type: boolean
 *                   nullable: true
 *                   description: true if unblock (soft delete) was successful
 */

import { NextRequest, NextResponse } from 'next/server';
import BlockedUser from '@/models/BlockedUser';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, targetUserId, block } = await req.json();

    if (typeof userId !== 'string' || typeof targetUserId !== 'string' || typeof block !== 'number') {
      return NextResponse.json({ status: false, message: 'Invalid input' }, { status: 400 });
    }

    if (block === 1) {
      // Block user (reactivate if soft-deleted, else create new)
      let blocked = await BlockedUser.findOne({ blockerId: userId, blockedId: targetUserId });
      if (blocked) {
        if (blocked.isDeleted) {
          blocked.isDeleted = false;
          blocked.blockedAt = new Date();
          await blocked.save();
        }
      } else {
        blocked = await BlockedUser.create({ blockerId: userId, blockedId: targetUserId });
      }
      return NextResponse.json({ status: true, action: 'blocked', blocked });
    } else if (block === 0) {
      // Unblock user (soft delete)
      const result = await BlockedUser.findOneAndUpdate(
        { blockerId: userId, blockedId: targetUserId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      return NextResponse.json({ status: true, action: 'unblocked', softDeleted: !!result });
    } else {
      return NextResponse.json({ status: false, message: 'Invalid block value' }, { status: 400 });
    }
  } catch (error) {
    console.error('Block/Unblock error:', error);
    return NextResponse.json({ status: false, message: 'Internal server error', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
