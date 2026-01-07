/**
 * @openapi
 * /api/customer/store/update:
 *   patch:
 *     summary: Update an existing store
 *     description: Endpoint to update only store name and description for a specific user store
 *     tags:
 *       - Store
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 description: MongoDB ObjectId of the store to update
 *                 example: "64d123abcd456ef789012345"
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user who owns the store
 *                 example: "64d999abcd456ef789045555"
 *               name:
 *                 type: string
 *                 description: Updated name of the store
 *                 example: "Updated Medical Store"
 *               description:
 *                 type: string
 *                 description: Updated description of the store
 *                 example: "New description for retail pharmacy store"
 *             required:
 *               - storeId
 *               - userId
 *               - name
 *               - description
 *     responses:
 *       200:
 *         description: Store updated successfully
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
 *                       example: "Store updated successfully"
 *                     store:
 *                       type: object
 *                       description: Updated store object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64d123abcd456ef789012345"
 *                         userId:
 *                           type: string
 *                           example: "64d999abcd456ef789045555"
 *                         name:
 *                           type: string
 *                           example: "Updated Medical Store"
 *                         description:
 *                           type: string
 *                           example: "Retail pharmacy store"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 */

// Endpoint: PATCH /api/customer/store/update

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import { StoreUpdateSchema } from "../validator/schema";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const validated = StoreUpdateSchema.safeParse(body);

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

    const { userId, name, description, storeId } = validated.data;

    // 2️⃣ Find store by userId
    const existingStore = await Store.findOne({ _id: storeId, userId, isDeleted: false });

    if (!existingStore) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'Store not found for this user'
          }
        },
        { status: 404 }
      );
    }

    // 3️⃣ Prevent duplicate store name for this user
    const duplicateNameStore = await Store.findOne({
      name,
      _id: { $ne: existingStore._id }
    });

    if (duplicateNameStore) {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'Another store with this name already exists'
          }
        },
        { status: 409 }
      );
    }

    // 4️⃣ Update only name and description
    existingStore.name = name;
    existingStore.description = description;

    const updatedStore = await existingStore.save();

    let storeProject={
        storeId:updatedStore._id,
        name:updatedStore.name,
        description:updatedStore.description
    }
    // 5️⃣ Success response
    return NextResponse.json({
      data: {
        status: true,
        message: 'Store updated successfully',
        store: storeProject
      }
    });

  } catch (error) {
    console.error('STORE UPDATE ERROR:', error);

    return NextResponse.json(
      {
        data: {
          status: false,
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}
