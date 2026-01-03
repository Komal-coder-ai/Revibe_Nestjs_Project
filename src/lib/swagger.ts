import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Revibe API Documentation',
    version: '1.0.0',
    description: 'API documentation for Revibe admin and customer platform',
    contact: {
      name: 'API Support',
      email: 'support@revibe.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server',
    },
    {
      url: 'https://revibe-nestjs-project.vercel.app',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      Admin: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Admin ID',
          },
          name: {
            type: 'string',
            description: 'Admin name',
          },
          email: {
            type: 'string',
            description: 'Admin email address',
          },
          countryCode: {
            type: 'string',
            description: 'Country code for phone number',
          },
          mobile: {
            type: 'string',
            description: 'Mobile number',
          },
          role: {
            type: 'string',
            description: 'Admin role',
            enum: ['admin', 'superadmin'],
          },
          isActive: {
            type: 'boolean',
            description: 'Admin active status',
          },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Customer ID',
          },
          email: {
            type: 'string',
            description: 'Customer email',
          },
          name: {
            type: 'string',
            description: 'Customer name',
          },
          phone: {
            type: 'string',
            description: 'Phone number',
          },
          address: {
            type: 'string',
            description: 'Customer address',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            description: 'User email address',
            example: 'admin@example.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'password123',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
          },
          message: {
            type: 'string',
            description: 'Response message',
          },
          data: {
            type: 'object',
            description: 'User data',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Always false for errors',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
  process.cwd() + '/src/app/api/**/route.ts',
  // process.cwd() + '/app/api/**/route.ts',
],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
