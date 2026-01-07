import { z } from "zod";

export const ProductCreateSchema = z.object({
    storeId: z.string()
        .min(1, "storeId is required"),

    userId: z.string()
        .min(1, "userId is required"),

    title: z.string()
        .min(1, "Product title is required")
        .trim(),

    link: z.string()
        .min(1, "Product link is required")
        .trim()
});

export const ProductDeleteSchema = z.object({
    productId: z.string()
        .min(1, "productId is required"),

    userId: z.string()
        .min(1, "userId is required")
});


export const ProductListQuerySchema = z.object({
    userId: z.string()
        .min(1, "userId is required"),
    targetUserId: z.string()
        .min(1, "targetUserId is required"),
    storeId: z.string()
        .min(1, "storeId is required"),

    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10)
});