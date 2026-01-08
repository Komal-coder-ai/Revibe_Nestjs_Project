import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TribeMember from '@/models/TribeMember';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/admin/tribe/members:
 *   post:
 *     summary: Get members of a tribe
 *     description: Fetch members of a specific tribe with pagination support
 *     tags:
 *       - Admin Tribes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tribeId:
 *                 type: string
 *                 description: Tribe ID to fetch members for
 *                 example: "12345abcde"
 *               limit:
 *                 type: integer
 *                 description: Number of members to fetch
 *                 example: 10
 *               offset:
 *                 type: integer
 *                 description: Number of members to skip
 *                 example: 0
 *     responses:
 *       200:
 *         description: Tribe members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       joinedDate:
 *                         type: string
 *       400:
 *         description: Bad request - tribeId required
 *       404:
 *         description: Tribe not found or no members
 *       500:
 *         description: Server error
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { tribeId, limit = 10, offset = 0 } = body;

    if (!tribeId) {
      return NextResponse.json(
        { success: false, message: 'Tribe ID is required' },
        { status: 400 }
      );
    }

    const members = await TribeMember.find({ tribeId })
      .skip(offset)
      .limit(limit)
      .lean();

    if (!members || members.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No members found for this tribe' },
        { status: 404 }
      );
    }

    const formattedMembers = members.map((member: any) => ({
      id: member._id.toString(),
      name: member.name,
      role: member.role,
      joinedDate: member.joinedDate
        ? new Date(member.joinedDate).toLocaleDateString('en-US')
        : '',
    }));

    return NextResponse.json({ success: true, data: formattedMembers });
  } catch (error) {
    console.error('Error fetching tribe members:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}