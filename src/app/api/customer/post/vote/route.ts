/**
 * @swagger
 * /api/customer/post/vote:
 *   patch:
 *     summary: Vote on a poll or quiz
 *     description: Allows a user to vote on a poll or quiz option for a post.
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
 *                 example: "65a1234567890abcdef67890"
 *               optionIndex:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Vote successful
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
 *                   example: "Vote successful"
 *                 vote:
 *                   type: object
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/db';
import Post from '@/models/Post';
import Vote from '@/models/Vote';
import { votePollSchema } from '../validator/schemas';

// PATCH /api/post/vote - Vote on a poll option
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parse = votePollSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'Validation error',
            errors: parse.error.issues
          }
        },
        { status: 400 });
    }
    const { postId, userId, optionIndex } = parse.data;
    const post = await Post.findById(postId);
    if (!post || (post.type !== 'poll' && post.type !== 'quiz')) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'Poll/Quiz not found'
          }
        },
        { status: 404 });
    }
    // Prevent double voting using Vote model
    const existingVote = await Vote.findOne({ user: userId, post: postId });
    if (existingVote) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'User already voted'
          }
        },
        { status: 409 });
    }
    // For quiz, check if answer is correct
    let isCorrect: boolean | undefined = undefined;
    let type: 'poll' | 'quiz' = post.type;
    if (type === 'quiz' && typeof post.correctOption === 'number') {
      isCorrect = post.correctOption === optionIndex;
    }
    // Save vote
    await Vote.create({ user: userId, post: postId, optionIndex, isCorrect, type });
    // Aggregate poll/quiz results
    const allVotes = await Vote.find({ post: postId });
    const totalVotes = allVotes.length;
    const optionCounts: Record<number, number> = {};
    allVotes.forEach((v: any) => {
      optionCounts[v.optionIndex] = (optionCounts[v.optionIndex] || 0) + 1;
    });
    const pollResults = (post.options || []).map((_: any, idx: number) => ({
      optionIndex: idx,
      count: optionCounts[idx] || 0,
      percent: totalVotes > 0 ? Math.round(((optionCounts[idx] || 0) / totalVotes) * 100) : 0
    }));
    return NextResponse.json({
      data: {
        status: true,
        message: 'Vote recorded',
        pollResults,
        totalVotes,
        postId: post._id
      }
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
