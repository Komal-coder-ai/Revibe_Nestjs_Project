/**
 * @swagger
 * /api/admin/user/userlist:
 *   get:
 *     summary: Get user list with pagination and search
 *     description: Fetch all users with pagination, search, sorting, and filtering capabilities. Returns formatted user data with pagination information.
 *     tags:
 *       - Admin Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page (default 10)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, username, or mobile number
 *         example: "john"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (default createdAt)
 *         example: "createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: integer
 *         description: Sort order 1 for ascending, -1 for descending (default -1)
 *         example: -1
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                         example: "65a1234567890abcdef12345"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       mobile:
 *                         type: string
 *                         example: "+1234567890"
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       profileType:
 *                         type: string
 *                         example: "public"
 *                       profileImage:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       joinedDate:
 *                         type: string
 *                         example: "01/15/2024"
 *                       status:
 *                         type: number
 *                         example: 1
 *                         description: "1 for Active, 0 for Inactive"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch users"
 *                 error:
 *                   type: string
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || '-1'; // -1 for descending, 1 for ascending

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch users with pagination and sorting
    const users = await User.find(filter)
      .sort({ [sortBy]: parseInt(order) as 1 | -1 })
      .skip(skip)
      .limit(limit)
      .select('_id name email username mobile isVerified profileType createdAt updatedAt profileImage status aadhar')
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    console.log('=== USERLIST FETCH ===');
    console.log('Total users in DB:', total);
    console.log('Raw user data before format:', users.map((u: any) => ({ id: u._id, status: u.status })));

    // Format users data
    const formattedUsers = users.map((user: any) => ({
      id: user._id?.toString(),
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      username: user.username || 'N/A',
      mobile: user.mobile || 'N/A',
      aadhar: user.aadhar || 'N/A',
      isVerified: user.isVerified || false,
      profileType: user.profileType || 'public',
      profileImage: user.profileImage?.[0]?.imageUrl || '',
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      status: user.status !== undefined ? user.status : (user.isVerified ? 1 : 0),
    }));

    console.log('Formatted users response:', formattedUsers.map((u: any) => ({ id: u.id, status: u.status })));
    console.log('=== END USERLIST FETCH ===');

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: formattedUsers,
        pagination: {
          current: page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
