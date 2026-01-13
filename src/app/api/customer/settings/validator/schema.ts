import { z } from 'zod';

export const notificationSettingsSchema = z.object({
  pauseAll: z.boolean().optional(),
  postLikes: z.boolean().optional(),
  comments: z.boolean().optional(),
  newFollowers: z.boolean().optional(),
  directMessages: z.boolean().optional(),
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
});
