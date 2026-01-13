/**
 * @swagger
 * /api/customer/product/update:
 *   patch:
 *     summary: Update a product
 *     description: Updates a product if the requesting user is the creator.
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
 *                 example: "65a1234567890abcdef12345"
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               title:
 *                 type: string
 *                 example: "New Product Title"
 *               link:
 *                 type: string
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product updated"
 *                 product:
 *                   type: object
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const { productId, userId, title, link } = await req.json();
        if (!productId || !userId) {
            return NextResponse.json({ data: { status: false, message: 'productId and userId required' } }, { status: 400 });
        }
        // Find the product and check ownership
        const product = await Product.findOne({ _id: productId, userId, isDeleted: false });
        if (!product) {
            return NextResponse.json({ data: { status: false, message: 'Product not found or not owned by user' } }, { status: 404 });
        }
        // Update allowed fields
        if (title !== undefined) product.title = title;
        if (link !== undefined) product.link = link;
        await product.save();
        return NextResponse.json({ data: { status: true, message: 'Product updated', product } });
    } catch (error) {
        console.error('Error updating product:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
