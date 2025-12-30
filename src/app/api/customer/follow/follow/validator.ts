import { z } from 'zod';

export const followActionSchema = z.object({
  targetUserId: z.string().min(1),
});
