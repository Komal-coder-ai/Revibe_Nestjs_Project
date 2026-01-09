import { z } from 'zod';

export const imageObjectSchema = z.object({
  imageUrl: z.string().min(1, 'imageUrl is required'),
  thumbUrl: z.string().optional(),
  type: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  orientation: z.string().optional(),
  format: z.string().optional(),
});



export const createTribeSchema = z.object({
  icon: z.array(imageObjectSchema),
  tribeName: z.string().min(1, 'tribeName is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'category is required'),
  bannerImage: z.array(imageObjectSchema).optional(),
  rules: z.array(z.string()).optional(),
  owner: z.string().min(1, 'owner is required'),
});

export const updateTribeSchema = z.object({
  icon: z.array(imageObjectSchema).optional(),
  tribeName: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  bannerImage: z.array(imageObjectSchema).optional(),
  rules: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});
