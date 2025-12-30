import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  mobile: z.string().optional(),
  countryCode: z.string().optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
});

