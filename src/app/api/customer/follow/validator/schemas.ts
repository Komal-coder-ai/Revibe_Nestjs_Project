import { z } from 'zod';

// Validation for follow/unfollow action
export const followActionSchema = z.object({
  userId: z.string().min(1),
  targetUserId: z.string().min(1),
});

// Validation for accepting/rejecting follow requests
export const followRequestActionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["1", "2"]), // 1 for accept, 2 for reject
  userId: z.string().min(1),
});

// You can add more follow-related schemas here as needed
