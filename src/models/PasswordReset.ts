import { Prisma } from '@prisma/client';

const PasswordReset = Prisma.defineModel({
  name: 'PasswordReset',
  fields: {
    id: { type: 'string', id: true, generated: true },
    email: { type: 'string', required: true },
    token: { type: 'string', required: true },
    expiry: { type: 'date', required: true },
  },
});

export default PasswordReset;