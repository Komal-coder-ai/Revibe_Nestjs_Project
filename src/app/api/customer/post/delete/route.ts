/**
 * @swagger
 * /api/customer/post/delete:
 *   patch:
 *     summary: Delete a post
 *     description: Soft deletes a post by its postId.
 *     tags:
 *       - Post
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
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *                   example: "Post deleted"
 *                 post:
 *                   type: object
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/db';
import Post from '@/models/Post';

// PATCH /api/post/delete - Soft delete a post
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { postId } = await req.json();
    if (!postId) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'postId required'
        }
      }, { status: 400 });
    const post = await Post.findByIdAndUpdate(postId, { isDeleted: true }, { new: true });
    if (!post) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'Post not found'
        }
      },
      { status: 404 });
    return NextResponse.json(
      {
        data: {
          status: true,
          message: 'Post deleted', post
        }
      });
  } catch (error) {
    console.error('Error deleting post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
