/**
 * @swagger
 * /api/customer/follow/follow:
 *   post:
 *     summary: Follow or unfollow a user
 *     description: Allows a user to follow or unfollow another user.
 *     tags:
 *       - Follow
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
 *               targetId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *               action:
 *                 type: string
 *                 enum: ["follow", "unfollow"]
 *                 example: "follow"
 *     responses:
 *       200:
 *         description: Follow/unfollow action successful
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
 *                   example: "Followed user"
 */
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';
import User from '@/models/User';
import { followActionSchema } from '../validator/schemas';

export async function POST(req: NextRequest) {
  try {
    // JWT is disabled, get userId from request body
    await connectDB();
    const body = await req.json();
    const parse = followActionSchema.safeParse(body);
    if (!parse.success) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'Validation error',
          errors: parse.error.issues
        }
      },
      { status: 400 });
    const { userId, targetUserId } = parse.data;
    if (!userId) return NextResponse.json({
      data: {
        status: false,
        message: 'userId is required in request body'
      }
    }, { status: 400 });
    if (userId === targetUserId) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'Cannot follow yourself'
        }
      }, { status: 400 });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'Target user not found'
        }
      }, { status: 404 });
    if (targetUser.blockedUsers?.includes(userId)) return NextResponse.json(
      {
        data:
        {
          status: false,
          message: 'You are blocked by this user'
        }
      }, { status: 403 });

    let follow = await Follow.findOne(
      {
        follower: userId,
        following: targetUserId,
        isDeleted: false
      });
    if (follow) {
      follow.isDeleted = true;
      await follow.save();
      return NextResponse.json({ data: { status: true, message: 'Unfollowed' } });
    }

    const status = targetUser.profileType === 'private' ? 'pending' : 'accepted';
    follow = await Follow.create({ follower: userId, following: targetUserId, status });
    return NextResponse.json(
      {
        data: {
          status: true,
          message: status === 'pending' ? 'Follow request sent' : 'Followed'
        }
      });
  } catch (error) {
    console.log('Error in follow/unfollow:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}

// Swagger documentation for this endpoint
export const swagger = {
  openapi: "3.0.0",
  info: {
    title: "Follow/Unfollow",
    version: "1.0.0"
  },
  // JWT security removed
  paths: {
    "/api/follow/follow": {
      post: {
        tags: ["Follow"],
        summary: "Follow or unfollow a user",
        requestBody: {
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/FollowAction" },
              example: { userId: "your_user_id_here", targetUserId: "target_user_id_here" }
            }
          }
        },
        responses: {
          "200": {
            description: "Followed or unfollowed",
            content: {
              "application/json": {
                schema: { "$ref": "#/components/schemas/DefaultResponse" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      // bearerAuth removed
    },
    schemas: {
      FollowAction: {
        type: "object",
        properties: {
          userId: { type: "string" },
          targetUserId: { type: "string" }
        },
        required: ["userId", "targetUserId"]
      },
      DefaultResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              status: { type: "boolean" },
              message: { type: "string" }
            },
            required: ["status", "message"]
          }
        },
        required: ["data"]
      }
    }
  }
};
