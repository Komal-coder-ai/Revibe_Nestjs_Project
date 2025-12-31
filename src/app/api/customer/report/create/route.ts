/**
 * @swagger
 * /api/customer/report/create:
 *   post:
 *     summary: Create a report for a post
 *     description: Allows a user to report a post. The reason is optional.
 *     tags:
 *       - Report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user reporting the post
 *               postId:
 *                 type: string
 *                 description: The ID of the post being reported
 *               reason:
 *                 type: string
 *                 description: Optional reason for reporting
 *             required:
 *               - userId
 *               - postId
 *     responses:
 *       200:
 *         description: Report created successfully
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
 *                     report:
 *                       type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from 'next/server';
import Report from '@/models/Report';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, postId, reason } = await req.json();
  if (!userId || !postId) {
    return NextResponse.json({ data: { status: false, message: 'userId and postId are required' } }, { status: 400 });
  }
  // Reason is optional
  const report = await Report.create({ userId, postId, ...(reason ? { reason } : {}) });
  return NextResponse.json({ data: { status: true, report } });
}