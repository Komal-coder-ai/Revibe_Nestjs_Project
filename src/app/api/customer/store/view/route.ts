/**
 * @openapi
 * /api/customer/store/view:
 *   get:
 *     summary: View store details
 *     description: Fetch store details for a specific store and user. Returns `isOwner` indicating if the logged-in user owns the store.
 *     tags:
 *       - Store
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the store
 *         example: "64d123abcd456ef789012345"
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: Logged-in user's MongoDB ObjectId
 *         example: "64d999abcd456ef789045555"
 *       - in: query
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the store owner
 *         example: "64d888abcd456ef789012333"
 *     responses:
 *       200:
 *         description: Store details fetched successfully
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
 *                       example: "Store details fetched successfully"
 *                     isOwner:
 *                       type: boolean
 *                       example: false
 *                     store:
 *                       type: object
 *                       description: Projected store details
 *                       properties:
 *                         storeId:
 *                           type: string
 *                           example: "64d123abcd456ef789012345"
 *                         name:
 *                           type: string
 *                           example: "My Medical Store"
 *                         description:
 *                           type: string
 *                           example: "Retail pharmacy store"
 *       400:
 *         description: Validation error – missing query params
 *       404:
 *         description: Store not found
 *       500:
 *         description: Internal server error
 */

// Endpoint: GET /api/customer/store/view

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import StoreView from '@/models/StoreView';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("userId") ?? undefined;        // logged-in user
    const targetUserId = searchParams.get("targetUserId"); // owner of the store
    const storeId = searchParams.get("storeId");

    // 1️⃣ Validate query params
    if (!targetUserId || !storeId) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: "targetUserId and storeId are required"
          }
        },
        { status: 400 }
      );
    }

    // 2️⃣ Find store
    const store = await Store.findOne({
      _id: storeId,
      userId: targetUserId,
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

    // 2️⃣ Insert store view (one user = one view)
    if (userId) {
      const existingView = await StoreView.findOne({ storeId, userId });
      if (!existingView) {
        await StoreView.create({ storeId, userId });
      }
    }

    // 2️⃣ Count total views
    let viewCount = await StoreView.countDocuments({ storeId });

    // product count
    const productCount = await Product.countDocuments({ storeId, isDeleted: false });

    const isOwner = userId === targetUserId;

    // 3️⃣ Custom projection
    const storeProject = {
      isOwner: isOwner,
      storeId: store._id.toString(),
      name: store.name,
      description: store.description,
      viewCount: viewCount || 0,
      productCount: productCount || 0
    };


    // 5️⃣ Response
    return NextResponse.json({
      data: {
        status: true,
        message: "Store details fetched successfully",
        store: storeProject
      }
    });

  } catch (error) {
    console.error("STORE VIEW ERROR:", error);

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
