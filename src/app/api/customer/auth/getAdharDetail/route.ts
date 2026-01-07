/**
 * @swagger
 * /api/customer/auth/getAdharDetail:
 *   get:
 *     summary: Get user's Aadhar details
 *     description: Returns the user's aadhar, aadharName, and userId by userId.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: The user ID to fetch Aadhar details for.
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Aadhar details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Aadhar details fetched"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "65a1234567890abcdef12345"
 *                     aadhar:
 *                       type: string
 *                       example: "1234-5678-9012"
 *                     aadharName:
 *                       type: string
 *                       example: "John Doe"
 */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET /api/customer/auth/getAdharDetail?userId=...
export async function GET(req: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url!);
		const userId = searchParams.get('userId');
		   if (!userId) {
			   return NextResponse.json({
				   data: {
					   status: false,
					   message: 'userId is required'
				   }
			   }, { status: 400 });
		   }

		   const user = await User.findById(userId).select('aadhar aadharName _id');
		   if (!user) {
			   return NextResponse.json({
				   data: {
					   status: false,
					   message: 'User not found'
				   }
			   }, { status: 404 });
		   }

		   return NextResponse.json({
			   data: {
				   status: true,
				   message: 'Aadhar details fetched',
				   userId: user._id?.toString?.() ?? user._id,
				   aadhar: user.aadhar || '',
				   aadharName: user.aadharName || ''
			   }
		   });
	} catch (error) {
		console.log(error);
		
		const message = (error instanceof Error) ? error.message : 'Internal server error';
		   return NextResponse.json({
			   data: {
				   status: false,
				   message
			   }
		   }, { status: 500 });
	}
}
