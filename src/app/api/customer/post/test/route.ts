import connectDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import {generateShortcodeForPost} from '@/common/common';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        // Find posts where shortcode is missing or empty
        const postsWithoutShortcode = await User.find({ $or: [ { shortcode: { $exists: false } }, { shortcode: '' } ] });
        let updatedCount = 0;
        for (const post of postsWithoutShortcode) {
            const shortcode = generateShortcodeForPost();
            post.shortcode = shortcode;
            await post.save();
            updatedCount++;
        }
        return NextResponse.json(
            {
                data: { status: true, message: `API is working. Updated ${updatedCount} posts with shortcode.` }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in GET /api/customer/post/test:', error);
        return NextResponse.json(
            {
                data: { status: false, message: 'Internal Server Error' }
            },
            { status: 500 }
        );
    }
}