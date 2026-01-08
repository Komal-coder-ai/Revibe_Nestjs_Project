/**
 * @swagger
 * /api/customer/post/edit:
 *   patch:
 *     summary: Edit a post
 *     description: Edits an existing post by its postId, updating text, caption, media, hashtags, and other options.
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
 *               text:
 *                 type: string
 *                 example: "Updated post text."
 *               caption:
 *                 type: string
 *                 example: "Updated caption"
 *               location:
 *                 type: string
 *                 example: "Delhi, India"
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *               taggedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       default: ""
 *                     thumbUrl:
 *                       type: string
 *                       default: ""
 *                     type:
 *                       type: string
 *                       default: ""
 *                     width:
 *                       type: string
 *                       default: ""
 *                     height:
 *                       type: string
 *                       default: ""
 *                     orientation:
 *                       type: string
 *                       default: ""
 *                     format:
 *                       type: string
 *                       default: ""
 *                 example:
 *                   - imageUrl: "http://res.cloudinary.com/drvxirfax/image/upload/v1767784450/users/profile/k76ta8f8hg0l9y8uwaa2.jpg"
 *                     thumbUrl: "http://res.cloudinary.com/drvxirfax/image/upload/v1767784450/users/profile/k76ta8f8hg0l9y8uwaa2.jpg"
 *                     type: "image"
 *                     width: "1080"
 *                     height: "720"
 *                     orientation: "landscape"
 *                     format: "jpg"
 *                 default:
 *                   - imageUrl: ""
 *                     thumbUrl: ""
 *                     type: ""
 *                     width: ""
 *                     height: ""
 *                     orientation: ""
 *                     format: ""
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctOption:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Post edited successfully
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
 *                   example: "Post edited"
 *                 post:
 *                   type: object
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/db';
import Post from '@/models/Post';
import { updatePostSchema } from '../validator/schemas';
import { extractHashtags } from '@/lib/hashtag';

// PATCH /api/post/edit - Edit a post
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parse = updatePostSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    }
    const {
      postId,
      text,
      caption,
      location,
      hashtags,
      taggedUsers,
      media,
      options,
      correctOption
    } = parse.data;
    const update: any = {};
    if (typeof text === 'string') update.text = text;
    if (typeof caption === 'string') update.caption = caption;
    if (typeof location === 'string') update.location = location;
    if (Array.isArray(taggedUsers)) update.taggedUsers = taggedUsers;
    if (Array.isArray(media)) update.media = media;
    if (Array.isArray(options)) update.options = options;
    if (typeof correctOption === 'number') update.correctOption = correctOption;
    // Always re-extract hashtags if text/caption/hashtags are updated
    if (typeof text === 'string' || typeof caption === 'string' || Array.isArray(hashtags)) {
      update.hashtags = hashtags || extractHashtags(((text || '') + ' ' + (caption || '')));
    }
    const post = await Post.findByIdAndUpdate(postId, update, { new: true });
    if (!post) return NextResponse.json(
      {
        data: {
          status: false,
          message: 'Post not found'
        }
      },
      { status: 404 });
    return NextResponse.json({
      data:
      {
        status: true,
        message: 'Post updated', post
      }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
