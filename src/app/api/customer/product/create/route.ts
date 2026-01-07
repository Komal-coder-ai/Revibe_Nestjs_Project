
/**
 * @openapi
 * /api/customer/product/create:
 *   post:
 *     summary: Create a new product for a store
 *     description: >
 *       Creates a product for a specific store. The store must exist and belong to the same user creating the product.
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the store
 *                 example: "64d123abcd456ef789012345"
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user creating the product
 *                 example: "64d999abcd456ef789045555"
 *               title:
 *                 type: string
 *                 description: Product title
 *                 example: "Paracetamol 500mg"
 *               link:
 *                 type: string
 *                 description: Product URL or reference link
 *                 example: "https://example.com/products/paracetamol"
 *             required:
 *               - storeId
 *               - userId
 *               - title
 *               - link
 *     responses:
 *       200:
 *         description: Product created successfully
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
 *                       example: "Product created successfully"
 *                     product:
 *                       type: object
 *                       description: Projected product details
 *                       properties:
 *                         productId:
 *                           type: string
 *                           example: "64d555abcd456ef789098765"
 *                         title:
 *                           type: string
 *                           example: "Paracetamol 500mg"
 *                         link:
 *                           type: string
 *                           example: "https://example.com/products/paracetamol"
 *                         storeId:
 *                           type: string
 *                           example: "64d123abcd456ef789012345"
 *                         userId:
 *                           type: string
 *                           example: "64d999abcd456ef789045555"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error – invalid input
 *       404:
 *         description: Store not found or does not belong to the user
 *       500:
 *         description: Internal server error
 */

// Endpoint: POST /api/customer/product/create

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { ProductCreateSchema } from "../validator/schema";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // 1️⃣ Validate input with Zod
        const validated = ProductCreateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: validated.error.issues[0].message
                    }
                },
                { status: 400 }
            );
        }

        const { title, link, storeId, userId } = validated.data;

        // 2️⃣ Check if store exists and belongs to this user
        const store = await Store.findOne({
            _id: storeId,
            userId,
            isDeleted: false
        });

        if (!store) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: "Store not found or does not belong to this user"
                    }
                },
                { status: 404 }
            );
        }

        // 3️⃣ Create product
        const product = await Product.create({
            title,
            link,
            storeId,
            userId
        });

        // 4️⃣ Projected response
        let productProject = {
            productId: product._id,
            title: product.title,
            link: product.link,
            storeId: product.storeId,
            userId: product.userId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };

        // 5️⃣ Success response
        return NextResponse.json({
            data: {
                status: true,
                message: "Product created successfully",
                product: productProject
            }
        });

    } catch (error) {
        console.error("PRODUCT CREATE ERROR:", error);

        return NextResponse.json(
            {
                data: {
                    status: false,
                    message: "Internal server error"
                }
            },
            { status: 500 }
        );
    }
}
