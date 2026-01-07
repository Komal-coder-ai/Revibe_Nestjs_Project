import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.string().length(24, 'Invalid postId'),
  userId: z.string().length(24, 'Invalid userId'),
  content: z.string().min(1, 'Comment cannot be empty'),
  mentions: z.array(z.string().length(24)).optional(),
  parentId: z.union([
    z.string().length(24, 'Invalid parentId'),
    z.literal(''),
    z.null()
  ]).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  mentions: z.array(z.string().length(24)).optional(),
});

export const commentIdSchema = z.object({
  commentId: z.string().length(24, 'Invalid commentId'),
});

export const getCommentsSchema = z.object({
  postId: z.string().length(24, 'Invalid postId'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});
