export const followSwagger = {
  '/api/follow/follow': {
    post: {
      tags: ['Follow'],
      summary: 'Follow or unfollow a user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FollowAction',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Followed or unfollowed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DefaultResponse' },
            },
          },
        },
      },
    },
  },
  '/api/follow/request': {
    patch: {
      tags: ['Follow'],
      summary: 'Accept or reject a follow request',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FollowRequestAction',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Request accepted or rejected',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DefaultResponse' },
            },
          },
        },
      },
    },
  },
  '/api/follow/followers': {
    get: {
      tags: ['Follow'],
      summary: 'Get followers list',
      parameters: [
        { name: 'userId', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
        { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: {
          description: 'Followers list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FollowersResponse' },
            },
          },
        },
      },
    },
  },
  '/api/follow/counts': {
    get: {
      tags: ['Follow'],
      summary: 'Get followers and following counts',
      parameters: [
        { name: 'userId', in: 'query', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: {
          description: 'Counts',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CountsResponse' },
            },
          },
        },
      },
    },
  },
  '/api/follow/blocked': {
    patch: {
      tags: ['Follow'],
      summary: 'Block or unblock a user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/BlockAction',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User blocked or unblocked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DefaultResponse' },
            },
          },
        },
      },
    },
  },
};

export const followSchemas = {
  FollowAction: {
    type: 'object',
    properties: {
      targetUserId: { type: 'string' },
    },
    required: ['targetUserId'],
  },
  FollowRequestAction: {
    type: 'object',
    properties: {
      requestId: { type: 'string' },
      action: { type: 'string', enum: ['accept', 'reject'] },
    },
    required: ['requestId', 'action'],
  },
  BlockAction: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      targetUserId: { type: 'string' },
      block: { type: 'boolean' },
    },
    required: ['userId', 'targetUserId', 'block'],
  },
  DefaultResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          status: { type: 'boolean' },
          message: { type: 'string' },
        },
        required: ['status', 'message'],
      },
    },
    required: ['data'],
  },
  FollowersResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          status: { type: 'boolean' },
          message: { type: 'string' },
          followers: { type: 'array', items: { type: 'object' } },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
        },
        required: ['status', 'message', 'followers', 'total', 'page', 'pageSize'],
      },
    },
    required: ['data'],
  },
  CountsResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          status: { type: 'boolean' },
          message: { type: 'string' },
          followers: { type: 'integer' },
          following: { type: 'integer' },
        },
        required: ['status', 'message', 'followers', 'following'],
      },
    },
    required: ['data'],
  },
};
