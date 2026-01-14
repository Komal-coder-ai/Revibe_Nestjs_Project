/**
 * @swagger
 * /api/customer/follow/removeFollower:
 *   post:
 *     summary: Remove a follower from your followers list
 *     description: Allows the logged-in user to remove another user from their followers (i.e., the other user will no longer follow you).
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
 *                 description: The ID of the logged-in user (the one removing a follower)
 *                 example: "65a1234567890abcdef12345"
 *               targetUserId:
 *                 type: string
 *                 description: The ID of the user to remove from your followers
 *                 example: "65a1234567890abcdef67890"
 *     responses:
 *       200:
 *         description: Follower removed successfully
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
 *                   example: "Follower removed successfully."
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import Follow from '@/models/Follow';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, targetUserId } = await req.json();
        if (!userId || !targetUserId) {
            return NextResponse.json({ status: false, message: 'userId and targetUserId are required.' }, { status: 400 });
        }
        // Soft delete: set isDeleted: true where targetUserId follows userId
        const result = await Follow.findOneAndUpdate(
            { follower: targetUserId, following: userId },
            { isDeleted: true }
        );
        if (!result) {
            return NextResponse.json(
                {
                    status: false,
                    message: 'Follower relationship not found.'
                },
                { status: 400 });
        }
        return NextResponse.json({ status: true, message: 'Follower removed successfully.' });
    } catch (error) {
        console.error('Error in POST /api/customer/follow/remove-follower:', error);
        return NextResponse.json(
            {
                status: false,
                message: 'Internal Server Error'
            },
            { status: 500 });
    }
}
