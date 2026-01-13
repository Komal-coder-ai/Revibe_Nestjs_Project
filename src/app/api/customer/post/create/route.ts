/**
 * @swagger
 * /api/customer/post/create:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post with media, text, hashtags, and other options.
 *     tags:
 *       - Post
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
 *                 default: ""
 *               tribeId:
 *                 type: string
 *                 example: "65a1234567890abcdef99999"
 *                 description: "Optional. The tribe ID to associate this post with. If not provided, creates a regular post."
 *               type:
 *                 type: string
 *                 example: "image"
 *                 default: "image"
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
 *               text:
 *                 type: string
 *                 example: "This is a post."
 *                 default: ""
 *               caption:
 *                 type: string
 *                 example: "My caption"
 *                 default: ""
 *               location:
 *                 type: string
 *                 example: "Mumbai, India"
 *                 default: ""
 *               postType:
 *                 type: integer
 *                 example: 1
 *                 default: 0
 *               taggedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65a1234567890abcdef12345", "65a1234567890abcdef67890"]
 *                 default: []
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                 example:
 *                   - text: "Stories"
 *                   - text: "Reels"
 *                   - text: "Posts"
 *                 default: []
 *               correctOption:
 *                 type: integer
 *                 description: "Index of the correct option (0-based)"
 *                 example: 1
 *                 default: 0
 *     responses:
 *       200:
 *         description: Post created successfully
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
 *                   example: "Post created"
 *                 post:
 *                   type: object
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { createPostSchema } from '../validator/schemas';
import { extractHashtags } from '@/lib/hashtag';
import Hashtag from '@/models/Hashtag';
import {generateShortcodeForPost} from '@/common/common';

// POST /api/post/create - Create a new post
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('Received create post request:', body);
    const parse = createPostSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    }
    const { userId, type, media, postType, text, caption, location, taggedUsers, options, correctOption, tribeId } = parse.data;
    console.log('create post:', parse.data);

    const hashtags = extractHashtags((text || '') + ' ' + (caption || ''));
    // Update hashtag counts in Hashtag collection
    if (hashtags.length > 0) {
      for (const tag of hashtags) {
        await Hashtag.findOneAndUpdate(
          { tag },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        );
      }
    }
    let shortcode = generateShortcodeForPost();
    // Ensure options is array of objects with text field for poll/quiz
    let formattedOptions = options;
    let formattedCorrectOption = correctOption;
    if ((type === 'poll' || type === 'quiz') && Array.isArray(options)) {
      formattedOptions = options.map(opt => typeof opt === 'object' && opt.text ? opt : { text: String(opt) });
      // For quiz, correctOption should be a number (index)
      if (type === 'quiz') {
        if (typeof correctOption === 'string' && correctOption !== '') {
          // Try to parse as integer index
          const idx = parseInt(correctOption, 10);
          formattedCorrectOption = isNaN(idx) ? undefined : idx;
        } else if (typeof correctOption === 'number') {
          formattedCorrectOption = correctOption;
        } else {
          formattedCorrectOption = undefined;
        }
      }
    }
    
    const post = await Post.create({
      user: userId,
      shortcode: shortcode,
      type,
      media: media || [],
      text: text || '',
      caption: caption || '',
      location: location || '',
      hashtags,
      taggedUsers: taggedUsers || [],
      options: formattedOptions || [],
      correctOption: formattedCorrectOption,
      postType: postType,
      pollResults: [],
      tribe: tribeId || undefined,
    });
    return NextResponse.json({ data: { status: true, message: 'Post created', post } });
  } catch (error) {
    console.error('Error creating post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
