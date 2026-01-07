/**
 * @openapi
 * /api/customer/store/create:
 *   post:
 *     summary: Create a new store
 *     description: Endpoint to create a new store with name, description and userId
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
 *                 description: The ID of the user creating the store
 *                 example: "64d111abcd222ef789012333"
 *               name:
 *                 type: string
 *                 description: Name of the store
 *                 example: "My Medical Store"
 *               description:
 *                 type: string
 *                 description: Description of the store
 *                 example: "Retail pharmacy store located in Indore"
 *             required:
 *               - userId
 *               - name
 *               - description
 *     responses:
 *       200:
 *         description: Store created successfully
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
 *                       example: "Store created successfully"
 *                     store:
 *                       type: object
 *                       description: Newly created store object
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate store conflict
 *       500:
 *         description: Internal server error
 */

// Endpoint: POST /api/customer/store/create
// Endpoint: POST /api/customer/store/create

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import User from '@/models/User';
import { StoreCreateSchema } from "../validator/schema";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // 1️⃣ Zod Validation inside route.ts
        const validatedData = StoreCreateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: validatedData.error.issues[0].message
                    }
                },
                { status: 400 }
            );
        }

        const { userId, name, description } = validatedData.data;
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: 'User not found'
                    }
                },
                { status: 404 }
            );
        }
        // 2️⃣ Duplicate check
        let isUserStore = await Store.findOne({ userId: userId });
        if (isUserStore) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: 'User already has a store'
                    }
                },
                { status: 409 }
            );
        }
        const existingStore = await Store.findOne({ name });
        if (existingStore) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: 'Store with this name already exists for this user'
                    }
                },
                { status: 409 }
            );
        }

        // 3️⃣ Create store
        const store = await Store.create({
            userId,
            name,
            description
        });

        let storeProject = {
            storeId: store._id,
            name: store.name,
            description: store.description
        }

        // 4️⃣ Success response
        return NextResponse.json({
            data: {
                status: true,
                message: 'Store created successfully',
                store: storeProject
            }
        });

    } catch (error) {
        console.error('STORE CREATE ERROR:', error);

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
