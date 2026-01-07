import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { updateTribeSchema } from '../validator/schema';
/**
 * @swagger
 * /api/customer/tribe/update:
 *   patch:
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
 */
// Update tribe details
export async function PATCH(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    const { tribeId, userId, ...updateBody } = body;
    if (!tribeId) {
        return NextResponse.json({ data: { status: false, message: 'Tribe id required' } }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ data: { status: false, message: 'userId is required for authorization' } }, { status: 400 });
    }
    // Check if user is owner or admin of the tribe
    const TribeMember = (await import('@/models/TribeMember')).default;
    const member = await TribeMember.findOne({ tribeId, userId });
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        return NextResponse.json({ data: { status: false, message: 'You are not authorized to update this tribe.' } }, { status: 403 });
    }
    const parse = updateTribeSchema.safeParse(updateBody);
    if (!parse.success) {
        return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    }
    const update = parse.data;
    // Prevent updating tribeName to a duplicate
    if (update.tribeName) {
        const existing = await Tribe.findOne({ tribeName: update.tribeName, _id: { $ne: tribeId } });
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
        const tribe = await Tribe.findByIdAndUpdate(tribeId, updateData, { new: true });
        if (!tribe) return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
        return NextResponse.json({ data: { status: true, tribe } });
    } catch (error) {
        console.log('Error updating tribe:', error);
        return NextResponse.json({ data: { status: false, message: error instanceof Error ? error.message : 'Error updating tribe' } }, { status: 500 });
    }
}
