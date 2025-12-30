/**
 * @swagger
 * /api/customer/like/target:
 *   post:
 *     summary: Like or unlike a target
 *     description: Allows a user to like or unlike a post or comment.
 *     tags:
 *       - Like
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
 *               targetId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *               targetType:
 *                 type: string
 *                 enum: ["post", "comment"]
 *                 example: "post"
 *               action:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *                 description: "1 for like, 0 for unlike"
 *     responses:
 *       200:
 *         description: Like/unlike action successful
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
 *                   example: "Liked"
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/db';
import Like from '@/models/Like';
import User from '@/models/User';
import { likeTargetSchema } from '../validator/schemas';
import { requireAuth } from '@/lib/authMiddleware';
import { verifyAccessToken } from '@/lib/jwt';


export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const parse = likeTargetSchema.safeParse(body);
        if (!parse.success) {
            return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
        }
        const { userId, targetId, targetType, action } = parse.data;
        // Validate user existence
        const userExists = await User.findById(userId);
        if (!userExists) {
            return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 404 });
        }
        if (action === 1) {
            // Upsert: if exists and isDeleted:true, set isDeleted:false; else create
            const like = await Like.findOneAndUpdate(
                { user: userId, targetId, targetType },
                { $set: { isDeleted: false } },
                { upsert: true, new: true }
            );
            return NextResponse.json({ data: { status: true, message: 'Liked' } });
        } else if (action === 0) {
            // Set isDeleted:true if exists
            const like = await Like.findOneAndUpdate(
                { user: userId, targetId, targetType, isDeleted: false },
                { $set: { isDeleted: true } },
                { new: true }
            );
            if (!like) {
                return NextResponse.json({ data: { status: false, message: 'Like not found or already unliked' } }, { status: 409 });
            }
            return NextResponse.json({ data: { status: true, message: 'Unliked' } });
        } else {
            return NextResponse.json({ data: { status: false, message: 'Invalid action' } }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ data: { status: false, message: (error as Error).message } }, { status: 500 });
    }
}
