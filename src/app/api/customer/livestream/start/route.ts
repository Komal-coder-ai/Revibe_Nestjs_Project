import { NextRequest, NextResponse } from 'next/server';
import LiveStream from '@/models/LiveStream';
import { connectToDB } from '@/lib/mongoose';
import mux from '@/lib/mux';

// Swagger documentation for this endpoint
export const swagger = {
  paths: {
    "/api/livestream/start": {
      post: {
        tags: ["LiveStream"],
        summary: "Start a new live stream",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  streamer: { type: "string", description: "User ID of the streamer" },
                  title: { type: "string", description: "Title of the stream" },
                  category: { type: "string", description: "Category of the stream" }
                },
                required: ["streamer", "title", "category"]
              },
              example: {
                streamer: "65a1b2c3d4e5f6a7b8c9d0e1",
                title: "My Live Stream",
                category: "Music"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Live stream started successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "boolean" },
                        stream: { type: "object" },
                        muxStream: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
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
    const { streamer, title, category } = await req.json();
    // Create Mux live stream
    const muxStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      reconnect_window: 60,
      test: false,
    });
    const muxStreamId = muxStream.id;
    const muxPlaybackId = muxStream.playback_ids?.[0]?.id || '';
    const stream = await LiveStream.create({
      streamer,
      title,
      category,
      muxStreamId,
      muxPlaybackId,
      isActive: true,
      startedAt: new Date(),
      viewers: []
    });
    return NextResponse.json({ data: { status: true, stream, muxStream } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}