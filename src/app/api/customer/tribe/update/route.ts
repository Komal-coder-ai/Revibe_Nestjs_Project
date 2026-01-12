import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { updateTribeSchema } from '../validator/schema';
/**
 * @swagger
 * /api/customer/tribe/update:
 *   post:
 *     summary: Update tribe details
 *     description: Updates tribe details. Only owner or admin can update. All fields are optional; only provided fields will be updated. Prevents duplicate tribeName.
 *     tags:
 *       - Tribe
 *     parameters:
 *       # Tribe ID is now in the request body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tribeId:
 *                 type: string
 *                 description: Tribe ID to update
 *                 example: "65a1234567890abcdef12345"
 *               userId:
 *                 type: string
 *                 description: User ID of the requester (must be owner or admin)
 *                 example: "65a1234567890abcdef12345"
 *               icon:
 *                 type: array
 *                 description: Array of tribe icon objects
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     thumbUrl:
 *                       type: string
 *                     type:
 *                       type: string
 *                     width:
 *                       type: string
 *                     height:
 *                       type: string
 *                     orientation:
 *                       type: string
 *                     format:
 *                       type: string
 *                 example:
 *                   [
 *                     {
 *                       imageUrl: "http://res.cloudinary.com/demo/image/upload/v1/icon.jpg",
 *                       thumbUrl: "http://res.cloudinary.com/demo/image/upload/v1/icon_thumb.jpg",
 *                       type: "image",
 *                       width: "256",
 *                       height: "256",
 *                       orientation: "square",
 *                       format: "jpg"
 *                     }
 *                   ]
 *               tribeName:
 *                 type: string
 *                 description: Tribe name
 *                 example: "65a1234567890abcdef12345"
 *               description:
 *                 type: string
 *                 description: Tribe description
 *                 example: "A group for nature enthusiasts."
 *               category:
 *                 type: string
 *                 description: Tribe category ID
 *                 example: "65a1234567890abcdef12345"
 *               bannerImage:
 *                 type: array
 *                 description: Array of tribe banner image objects (optional)
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     thumbUrl:
 *                       type: string
 *                     type:
 *                       type: string
 *                     width:
 *                       type: string
 *                     height:
 *                       type: string
 *                     orientation:
 *                       type: string
 *                     format:
 *                       type: string
 *                 example:
 *                   [
 *                     {
 *                       imageUrl: "http://res.cloudinary.com/demo/image/upload/v1/banner.jpg",
 *                       thumbUrl: "http://res.cloudinary.com/demo/image/upload/v1/banner_thumb.jpg",
 *                       type: "image",
 *                       width: "1920",
 *                       height: "480",
 *                       orientation: "landscape",
 *                       format: "jpg"
 *                     }
 *                   ]
 *               rules:
 *                 type: array
 *                 description: Array of rules for the tribe
 *                 items:
 *                   type: string
 *                 example: ["Be respectful.", "No spam."]
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
 */
// Update tribe details
export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    // Validate the full body (including userId and tribeId)
    const parse = updateTribeSchema.safeParse(body);
    if (!parse.success) {
        return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    }
    const { tribeId, userId, ...update } = parse.data;
    // Check if user is owner or admin of the tribe
    const TribeMember = (await import('@/models/TribeMember')).default;
    const member = await TribeMember.findOne({ tribeId, userId });
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        return NextResponse.json({ data: { status: false, message: 'You are not authorized to update this tribe.' } }, { status: 403 });
    }
    // Prevent updating tribeName to a duplicate
    if (update.tribeName) {
        const existing = await Tribe.findOne({ tribeName: update.tribeName, _id: { $ne: tribeId } });
        if (existing) {
            return NextResponse.json({ data: { status: false, message: 'A tribe with this name already exists.' } }, { status: 400 });
        }
    }
    // If category is being updated, check if the category exists
    if (update.category) {
        const TribeCategory = (await import('@/models/TribeCategory')).default;
        const categoryExists = await TribeCategory.findById(update.category);
        if (!categoryExists) {
            return NextResponse.json({ data: { status: false, message: 'Category not found' } }, { status: 400 });
        }
    }
    // Only allow updating allowed fields
    const allowedFields = ['icon', 'tribeName', 'description', 'category', 'bannerImage', 'rules', 'isPublic'] as const;
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(update, key) && update[key] !== undefined) {
            updateData[key] = update[key];
        }
    }
    try {
        const tribe = await Tribe.findByIdAndUpdate(tribeId, updateData, { new: true });
        if (!tribe) return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
        // Convert _id to tribeId in the response
        const tribeObj = tribe.toObject ? tribe.toObject() : { ...tribe };
        tribeObj.tribeId = tribeObj._id;
        delete tribeObj._id;
        return NextResponse.json({ data: { status: true, tribe: tribeObj } });
    } catch (error) {
        console.log('Error updating tribe:', error);
        return NextResponse.json({ data: { status: false, message: error instanceof Error ? error.message : 'Error updating tribe' } }, { status: 500 });
    }
}
