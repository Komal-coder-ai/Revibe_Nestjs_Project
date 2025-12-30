import { z } from 'zod';

export const likeTargetSchema = z.object({
  userId: z.string().min(1),
  targetId: z.string().min(1),
  targetType: z.enum(['post', 'comment']),
  action: z.union([z.literal(1), z.literal(0)]).default(1)
});

export const unlikeTargetSchema = likeTargetSchema;
