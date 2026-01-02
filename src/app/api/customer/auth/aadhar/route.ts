
import { NextResponse } from 'next/server';
// Update the import path below if your mongoose connection utility is in a different location
import connectDB from '@/lib/db';
// If the file does not exist, create 'lib/mongoose.ts' with your connectDB function.
import User from '@/models/User';
import { aadharSchema } from '../validator/schemas';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    /**
     * @swagger
     * /api/customer/auth/aadhar:
     *   post:
     *     summary: Save user's Aadhar number
     *     description: Validates and saves the Aadhar number for a user. Checks for uniqueness and updates the user profile.
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: string
     *                 example: "65a1234567890abcdef12345"
     *               aadhar:
     *                 type: string
     *                 example: "123456789012"
     *     responses:
     *       200:
     *         description: Aadhar saved successfully
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
     *                   example: "Aadhar saved"
     *                 userId:
     *                   type: string
     *                 aadharEntered:
     *                   type: boolean
     *                 profileCompleted:
     *                   type: boolean
     *                 aadharNo:
     *                   type: string
     *                 name:
     *                   type: string
     *                   example: "Rajesh Kumar"
     
     */
    const parse = aadharSchema.safeParse(body);
    if (!parse.success) return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
    const { userId, aadhar } = parse.data;

    // Check if aadhar is already used by another user
    const existing = await User.findOne({ aadhar, _id: { $ne: userId } });
    if (existing) {
      return NextResponse.json(
        {
          data:
          {
            status: false,
            message: 'Aadhar already in use'
          }
        }, { status: 400 });
    }
    let aadharName = "rajesh singh";
    const user = await User.findByIdAndUpdate(userId,
      { aadhar, aadharName },
      { new: true });

    if (!user) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'User not found'
        }
      }, { status: 404 });

    // Only return aadharEntered and profileCompleted
    const aadharEntered = Boolean(user.aadhar && user.aadhar.length > 0);
    const profileCompleted = Boolean(user.username && user.profileImage);
    return NextResponse.json({
      data: {
        status: true,
        message: 'Aadhar saved',
        userId: user._id,
        aadharEntered,
        profileCompleted,
        aadharNo: user.aadhar,
        aadharName: aadharName,
        name: user.name
      }
    });
  } catch (error) {
    console.log('Error in save Aadhar:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
