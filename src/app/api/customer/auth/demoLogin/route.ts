// /**
//  * @swagger
//  * /api/customer/auth/demoLogin:
//  *   post:
//  *     summary: Demo user login
//  *     description: Authenticates or creates a demo user for the provided deviceId. Returns JWT token and user info.
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               deviceId:
//  *                 type: string
//  *                 example: "demo-device-123"
//  *     responses:
//  *       200:
//  *         description: Demo login successful
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: "success"
//  *                 message:
//  *                   type: string
//  *                   example: "Demo login successful"
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     userId:
//  *                       type: string
//  *                     token:
//  *                       type: string
//  *                     user:
//  *                       type: object

//  */
// import { NextRequest, NextResponse } from 'next/server';
// import User from '@/models/User';
// import jwt from 'jsonwebtoken';
// import connectDB from '@/lib/db';

// // Demo user config
// const DEMO_USER_TYPE = 'demo';

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();
//     // Get deviceId from request body and validate
//     const body = await req.json();
//     const { demoLoginSchema } = await import('../validator/schemas');
//     const parse = demoLoginSchema.safeParse(body);
//     if (!parse.success) {
//       return NextResponse.json({ data: { status: 'error', message: 'deviceId is required', errors: parse.error.issues } }, { status: 400 });
//     }
//     const { deviceId } = parse.data;
//     // Check if a demo user already exists for this deviceId
//     let user = await User.findOne({ deviceId, userType: DEMO_USER_TYPE });
//     if (!user) {
//       const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random
//       const demoMobile = `DEMO${randomNum}`;
//       const demoUsername = `DemoUser${randomNum}`;
//       // Generate 10-digit hexadecimal referral code
//       const referralCode = Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
//       user = await User.create({
//         mobile: demoMobile,
//         userType: DEMO_USER_TYPE,
//         aadhar: '',
//         username: demoUsername,
//         isVerified: false,
//         deviceId,
//         referralCode
//       });
//     }
//     // Generate tokens using ACCESS_TOKEN_SECRET for consistency
//     const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';
//     const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';
//     const accessToken = jwt.sign({ userId: user._id, userType: DEMO_USER_TYPE }, ACCESS_SECRET, { expiresIn: '1h' });
//     const refreshToken = jwt.sign({ userId: user._id, userType: DEMO_USER_TYPE }, REFRESH_SECRET, { expiresIn: '7d' });
//     user.refreshToken = refreshToken;
//     await user.save();
//     return NextResponse.json({
//       data: {
//         status: true,
//         message: 'Demo user login successful',
//         userId: user._id,
//         accessToken,
//         refreshToken,
//         userType: DEMO_USER_TYPE,
//         deviceId
//       }
//     });
//   } catch (error) {
//     console.log('Error in demo login:', error);
//     const message = (error instanceof Error) ? error.message : 'Internal server error';
//     return NextResponse.json({ data: { status: false, message } }, { status: 500 });
//   }
// }
