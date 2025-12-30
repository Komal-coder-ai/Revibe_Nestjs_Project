import { NextRequest, NextResponse } from 'next/server';
import LiveStream from '@/models/LiveStream';
import { connectToDB } from '@/lib/mongoose';

// Swagger documentation for this endpoint
export const swagger = {
  paths: {
    "/api/livestream/view": {
      post: {
        tags: ["LiveStream"],
        summary: "Join a live stream and get viewer details",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  streamId: { type: "string", description: "LiveStream ID" },
                  userId: { type: "string", description: "User ID joining the stream" }
                },
                required: ["streamId", "userId"]
              },
              example: {
                streamId: "65a1b2c3d4e5f6a7b8c9d0e1",
                userId: "65a1b2c3d4e5f6a7b8c9d0e2"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Viewer joined and details returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "boolean" },
                        viewerCount: { type: "integer" },
                        viewers: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": { description: "Stream not found or inactive", content: { "application/json": {} } },
          "500": { description: "Server error", content: { "application/json": {} } }
        }
      }
    }
  },
  components: {
    schemas: {}
  }
};

export async function POST(req: NextRequest) {
  await connectToDB();
  try {
    const { streamId, userId } = await req.json();
    const stream = await LiveStream.findById(streamId);
    if (!stream || !stream.isActive) {
      return NextResponse.json({ data: { status: false, message: 'Stream not found or inactive' } }, { status: 404 });
    }
    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      await stream.save();
    }
    // Populate viewer user details
    const populatedStream = await LiveStream.findOne({ _id: streamId }).populate('viewers').lean() as { viewers?: any[] } | null;
    if (!populatedStream || !('viewers' in populatedStream) || !Array.isArray(populatedStream.viewers)) {
      return NextResponse.json({ data: { status: false, message: 'Stream not found after update' } }, { status: 404 });
    }
    return NextResponse.json({ data: { status: true, viewerCount: populatedStream.viewers.length, viewers: populatedStream.viewers } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}