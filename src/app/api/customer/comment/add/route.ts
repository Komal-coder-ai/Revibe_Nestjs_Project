/**
 * @swagger
 * /api/customer/comment/add:
 *   post:
 *     summary: Add a comment
 *     description: Adds a new comment to a post.
 *     tags:
 *       - Comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               content:
 *                 type: string
 *                 example: "This is a comment."
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *               parentId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Comment added successfully
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
 *                   example: "Comment added"
 *                 comment:
 *                   type: object
 */
import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import { createCommentSchema } from '../validator/schemas';
import connectDB from '@/lib/db';


export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Validation error',
          errors: parsed.error.issues
        }
      }, { status: 400 });
    }
    const { postId, userId, content, mentions = [], parentId = null } = parsed.data;

    // Check if user is demo
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'User not found'
        }
      }, { status: 404 });
    }

    const comment = await Comment.create({
      postId,
      userId,
      content,
      mentions,
      parentId,
      isDeleted: false
    });
    return NextResponse.json({
      data: {
        status: true,
        message: 'Comment created',
        comment
      }
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({
      data: {
        status: false,
        message: error.message
      }
    }, { status: 500 });
  }
}

