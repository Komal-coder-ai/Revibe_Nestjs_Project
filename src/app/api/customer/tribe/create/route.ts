/**
 * @openapi
 * /api/customer/tribe/create:
 *   post:
 *     summary: Create a new tribe
 *     description: Creates a new tribe with images, name, description, category, rules, and owner.
 *     tags:
 *       - Tribe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - icon
 *               - tribeName
 *               - description
 *               - category
 *               - rules
 *               - owner
 *             properties:
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
 *                 example: "Nature Lovers"
 *               description:
 *                 type: string
 *                 description: Tribe description
 *                 example: "A group for nature enthusiasts."
 *               category:
 *                 type: string
 *                 description: Tribe category
 *                 example: "695f7934790a92e6832755af"
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
 *                 type: string
 *                 description: Rules for the tribe (text)
 *                 example: "Be respectful. No spam."
 *               owner:
 *                 type: string
 *                 description: User ID of tribe creator
 *                 example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Tribe created successfully
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
 *                       description: Created tribe object
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { createTribeSchema } from '../validator/schema';

// Create a new tribe
export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    const parse = createTribeSchema.safeParse(body);
    if (!parse.success) {
        return NextResponse.json({
            data: {
                status: false,
                message: 'Validation error',
                errors: parse.error.issues
            }
        }, { status: 400 });
    }
    
    let { icon, tribeName, description, category, bannerImage, rules, owner } = parse.data;
    // Ensure icon and bannerImage are arrays to match Tribe model
    // Ensure icon and bannerImage are arrays and have required properties
    
    // Validate owner id
    // Check if owner exists in User model
    const User = (await import('@/models/User')).default;
    const ownerExists = await User.findById(owner);
    if (!ownerExists) {
        return NextResponse.json({ data: { status: false, message: 'Owner user not found' } }, { status: 400 });
    }
    // Validate category id
    if (category) {
        const TribeCategory = (await import('@/models/TribeCategory')).default;
        const categoryExists = await TribeCategory.findById(category);
        if (!categoryExists) {
            return NextResponse.json({ data: { status: false, message: 'Category not found' } }, { status: 400 });
        }
    }
    try {
        // Check for existing tribe with the same name
        const existing = await Tribe.findOne({ tribeName });
        if (existing) {
            return NextResponse.json({ data: { status: false, message: 'A tribe with this name already exists.' } }, { status: 400 });
        }
        const tribe = await Tribe.create({
            icon,
            tribeName,
            description,
            category,
            bannerImage,
            rules,
            owner,
        });

        // Add creator as a member of the tribe
        const TribeMember = (await import('@/models/TribeMember')).default;
        await TribeMember.create({
            userId: owner,
            tribeId: tribe._id,
            role: 'owner',
        });

        // Project only required fields in the response
        const projectedTribe = {
            tribeId: tribe._id,
            tribeName: tribe.tribeName,
            description: tribe.description,
            category: tribe.category,
            icon: tribe.icon,
            bannerImage: tribe.bannerImage,
            rules: tribe.rules,
            owner: tribe.owner,
            isPublic: tribe.isPublic,
            createdAt: tribe.createdAt,
            updatedAt: tribe.updatedAt
        };

        return NextResponse.json({ data: { status: true, tribe: projectedTribe } });
    } catch (error) {
        console.error('Error creating tribe:', error);
        return NextResponse.json({ data: { status: false, message: error instanceof Error ? error.message : 'Error creating tribe' } }, { status: 500 });
    }
}
