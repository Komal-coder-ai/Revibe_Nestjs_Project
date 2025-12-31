// Swagger documentation for follow/unfollow endpoint
export const swagger = {
  openapi: "3.0.0",
  info: {
    title: "Follow/Unfollow",
    version: "1.0.0"
  },
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
    securitySchemes: {},
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
