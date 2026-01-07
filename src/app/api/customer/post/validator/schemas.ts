// For poll voting
export const votePollSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
  optionIndex: z.number().min(0)
});

import { z } from 'zod';

const mediaObjectSchema = z.object({
  imageUrl: z.string().url(),
  thumbUrl: z.string().url().optional(),
  type: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  orientation: z.string().optional(),
  format: z.string().optional(),
});

export const createPostSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  tribeId: z.string().optional(),
  type: z.enum(['image', 'video', 'text', 'carousel', 'poll', 'quiz', 'reel']),
  media: z.array(mediaObjectSchema).optional(),
  text: z.string().optional(),
  caption: z.string().optional(),
  location: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  taggedUsers: z.array(z.string()).optional(),
  // For poll/quiz
  options: z.array(z.object({
    text: z.string(),
    // isCorrect removed: only one correct answer, use correctOption
  })).optional(),
  correctOption: z.number().optional() // Only for quiz
});

export const updatePostSchema = z.object({
  postId: z.string().min(1),
  text: z.string().optional(),
  caption: z.string().optional(),
  location: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  taggedUsers: z.array(z.string()).optional(),
  media: z.array(mediaObjectSchema).optional(),
  options: z.array(z.object({
    text: z.string(),
    // isCorrect removed: only one correct answer, use correctOption
  })).optional(),
  correctOption: z.number().optional()
});
