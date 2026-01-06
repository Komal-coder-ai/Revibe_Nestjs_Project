import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { updateTribeSchema } from '../validator/schema';

/**
 * @openapi
 * /api/customer/tribe/update:
 *   patch:
 *     summary: Update tribe details
 *     description: Updates tribe details. All fields are optional; only provided fields will be updated. Prevents duplicate tribeName.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tribe ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               icon:
 *                 type: object
 *                 description: Tribe icon object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                   thumbUrl:
 *                     type: string
 *                   type:
 *                     type: string
 *                   width:
 *                     type: string
 *                   height:
 *                     type: string
 *                   orientation:
 *                     type: string
 *                   format:
 *                     type: string
 *                 example:
 *                   imageUrl: "https://example.com/icon.jpg"
 *                   thumbUrl: "https://example.com/icon_thumb.jpg"
 *                   type: "image"
 *                   width: "256"
 *                   height: "256"
 *                   orientation: "square"
 *                   format: "jpg"
 *               tribeName:
 *                 type: string
 *                 description: Tribe name
 *                 example: "Nature Lovers"
 *               description:
 *                 type: string
 *                 description: Tribe description
 *                 example: "A group for nature enthusiasts."
 *               category:
 *                 type: string
 *                 description: Tribe category
 *                 example: "Nature"
 *               bannerImage:
 *                 type: object
 *                 description: Tribe banner image object (optional)
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                   thumbUrl:
 *                     type: string
 *                   type:
 *                     type: string
 *                   width:
 *                     type: string
 *                   height:
 *                     type: string
 *                   orientation:
 *                     type: string
 *                   format:
 *                     type: string
 *                 example:
 *                   imageUrl: "https://example.com/banner.jpg"
 *                   thumbUrl: "https://example.com/banner_thumb.jpg"
 *                   type: "image"
 *                   width: "1920"
 *                   height: "480"
 *                   orientation: "landscape"
 *                   format: "jpg"
 *               rules:
 *                 type: string
 *                 description: Rules for the tribe (text)
 *                 example: "Be respectful. No spam."
 *     responses:
 *       200:
 *         description: Tribe updated successfully
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
 *                     tribe:
 *                       type: object
 *                       description: Updated tribe object
 *       400:
 *         description: Validation error or duplicate tribeName
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
 *                     message:
 *                       type: string
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Tribe not found
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
 *                     message:
 *                       type: string
 *       500:
 *         description: Server error
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
 *                     message:
 *                       type: string
 */
// Update tribe details
export async function PATCH(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ data: { status: false, message: 'Tribe id required' } }, { status: 400 });
    const body = await req.json();
    const parse = updateTribeSchema.safeParse(body);
    if (!parse.success) {
        return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    }
    const update = parse.data;
    // Prevent updating tribeName to a duplicate
    if (update.tribeName) {
        const existing = await Tribe.findOne({ tribeName: update.tribeName, _id: { $ne: id } });
        if (existing) {
            return NextResponse.json({ data: { status: false, message: 'A tribe with this name already exists.' } }, { status: 400 });
        }
    }
    // Only allow updating allowed fields
    const allowedFields = ['icon', 'tribeName', 'description', 'category', 'bannerImage', 'rules'] as const;
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(update, key) && update[key] !== undefined) {
            updateData[key] = update[key];
        }
    }
    try {
        const tribe = await Tribe.findByIdAndUpdate(id, updateData, { new: true });
        if (!tribe) return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
        return NextResponse.json({ data: { status: true, tribe } });
    } catch (error) {
        return NextResponse.json({ data: { status: false, message: error instanceof Error ? error.message : 'Error updating tribe' } }, { status: 500 });
    }
}
