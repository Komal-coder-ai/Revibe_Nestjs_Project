import { z } from "zod";

export const StoreCreateSchema = z.object({
    userId: z.string().min(12, 'userId is required'),
    name: z.string().min(2, 'name is required').trim(),
    description: z.string().min(5, 'description is required').trim()
});

export const StoreUpdateSchema = z.object({
    userId: z.string().min(12, 'userId is required'),
    storeId: z.string().min(12, 'storeId is required'),
    name: z.string().optional(),
    description: z.string().optional()
});

export const StoreDeleteSchema = z.object({
    userId: z.string()
        .min(24, "userId is required"),
    storeId: z.string()
        .min(24, "storeId is required")
});