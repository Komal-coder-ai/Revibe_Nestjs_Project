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
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               type:
 *                 type: integer
 *                 description: 1 for user post, 2 for tribe post
 *                 example: 1
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
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Tribe from '@/models/Tribe';

// PATCH /api/post/delete - Soft delete a post
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { postId, userId, type } = await req.json();
    if (!postId || !userId || !type) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'postId, userId, and type required'
        }
      }, { status: 400 });

    // Find the post
    const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true } });
    if (!post) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'Post not found'
        }
      }, { status: 404 });

    // If type is 1, only the creator can delete and post must not be related to a tribe
    if (type === 1) {
      if (String(post.user) !== String(userId)) {
        return NextResponse.json({
          data: {
            status: false,
            message: 'You are not allowed to delete this post'
          }
        }, { status: 403 });
      }
      if (post.tribe) {
        return NextResponse.json({
          data: {
            status: false,
            message: 'This post is related to a tribe and cannot be deleted as a user post.'
          }
        }, { status: 400 });
      }
    }
    // If type is 2, only the tribe owner can delete
    else if (type === 2) {
      if (!post.tribe) {
        return NextResponse.json({
          data: {
            status: false,
            message: 'Tribe post missing tribe info'
          }
        }, { status: 400 });
      }
      // Find the tribe and check owner
      const tribe = await Tribe.findOne({ _id: post.tribe, isDeleted: false });
      if (!tribe || String(tribe.owner) !== String(userId)) {
        return NextResponse.json({
          data: {
            status: false,
            message: 'Only the tribe owner can delete this post'
          }
        }, { status: 403 });
      }
    } else {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Invalid post type'
        }
      }, { status: 400 });
    }

    // Soft delete the post
    post.isDeleted = true;
    await post.save();
    return NextResponse.json(
      {
        data: {
          status: true,
          message: 'Post deleted',
        }
      });
  } catch (error) {
    console.error('Error deleting post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
