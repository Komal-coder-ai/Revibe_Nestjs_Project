/**
 * @openapi
 * /api/customer/product/list:
 *   get:
 *     summary: Get list of products of a target user
 *     description: >
 *       Fetches products for a specific store and target user. Supports pagination and returns only non-deleted products.
 *       `userId` is the logged-in user making the request. `isOwner` will be true if the logged-in user is the owner of the products.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Logged-in user's MongoDB ObjectId
 *         example: "64d999abcd456ef789045555"
 *       - in: query
 *         name: targetUserId
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the user whose products are being viewed
 *         example: "64d888abcd456ef789012333"
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the store
 *         example: "64d123abcd456ef789012345"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Products fetched successfully"
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     isOwner:
 *                       type: boolean
 *                       example: false
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           link:
 *                             type: string
 *                           storeId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

// Endpoint: GET /api/customer/product/list?userId=...&targetUserId=...&storeId=...&page=...&limit=...

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ProductListQuerySchema } from "../validator/schema";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const query = Object.fromEntries(url.searchParams.entries());

        // 1️⃣ Validate query params
        const validated = ProductListQuerySchema.safeParse(query);

        if (!validated.success) {
            return NextResponse.json(
                { data: { status: false, message: validated.error.issues[0].message } },
                { status: 400 }
            );
        }

        const { userId, targetUserId, storeId, page, limit } = validated.data;
        const skip = (page - 1) * limit;

        // 2️⃣ Fetch products of target user
        const products = await Product.find({
            storeId,
            userId: targetUserId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments({
            storeId,
            userId: targetUserId,
            isDeleted: false
        });

        // 3️⃣ Project products
        const productsProjected = products.map(p => ({
            productId: p._id,
            title: p.title,
            link: p.link,
            storeId: p.storeId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }));

        // 4️⃣ Determine ownership
        const isOwner = userId === targetUserId;

        // 5️⃣ Response
        return NextResponse.json({
            data: {
                status: true,
                message: "Products fetched successfully",
                total,
                page,
                limit,
                isOwner,
                products: productsProjected
            }
        });

    } catch (error) {
        console.error("PRODUCT LIST ERROR:", error);
        return NextResponse.json(
            { data: { status: false, message: "Internal server error" } },
            { status: 500 }
        );
    }
}
