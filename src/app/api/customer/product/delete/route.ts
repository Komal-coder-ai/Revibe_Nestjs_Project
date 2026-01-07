/**
 * @openapi
 * /api/customer/product/delete:
 *   post:
 *     summary: Delete a product (soft delete)
 *     description: >
 *       Soft deletes a product by marking `isDeleted = true`. 
 *       Only the user who created the product can delete it.
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: MongoDB ObjectId of the product to delete
 *                 example: "64d555abcd456ef789098765"
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user deleting the product
 *                 example: "64d999abcd456ef789045555"
 *             required:
 *               - productId
 *               - userId
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                       example: "Product deleted successfully"
 */

// Endpoint: DELETE /api/customer/product/delete

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ProductDeleteSchema } from "../validator/schema";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // 1️⃣ Validate input
        const validated = ProductDeleteSchema.safeParse(body);

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

        const { productId, userId } = validated.data;

        // 2️⃣ Check if product exists and belongs to user
        const product = await Product.findOne({
            _id: productId,
            userId,
            isDeleted: false
        });

        if (!product) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: "Product not found or does not belong to this user"
                    }
                },
                { status: 404 }
            );
        }

        // 3️⃣ Soft delete
        product.isDeleted = true;
        await product.save();

        // 5️⃣ Success response
        return NextResponse.json({
            data: {
                status: true,
                message: "Product deleted successfully",
            }
        });

    } catch (error) {
        console.error("PRODUCT DELETE ERROR:", error);

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
