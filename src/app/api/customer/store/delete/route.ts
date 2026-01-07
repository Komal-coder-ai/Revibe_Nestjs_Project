/**
 * @openapi
 * /api/customer/store/delete:
 *   post:
 *     summary: Delete a store
 *     description: Endpoint to delete a specific store for a user (soft delete)
 *     tags:
 *       - Store
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user
 *                 example: "64d999abcd456ef789045555"
 *               storeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the store to delete
 *                 example: "64d123abcd456ef789012345"
 *             required:
 *               - userId
 *               - storeId
 *     responses:
 *       200:
 *         description: Store deleted successfully
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
 *                       example: "Store deleted successfully"
 *                     store:
 *                       type: object
 *                       description: Projected deleted store info
 *       400:
 *         description: Validation error
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 */

// Endpoint: DELETE /api/customer/store/delete

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import { StoreDeleteSchema } from "../validator/schema";
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const validated = StoreDeleteSchema.safeParse(body);

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

    const { userId, storeId } = validated.data;

    // Soft delete pattern (better for future use)
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
            message: "Store not found"
          }
        },
        { status: 404 }
      );
    }

    // Mark as deleted instead of removing
    store.isDeleted = true;
    await store.save();

    // Projected response
    // let storeProject = {
    //   storeId: store._id,
    //   name: store.name,
    //   description: store.description
    // };

    return NextResponse.json({
      data: {
        status: true,
        message: "Store deleted successfully",
      }
    });

  } catch (error) {
    console.error("STORE DELETE ERROR:", error);

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
