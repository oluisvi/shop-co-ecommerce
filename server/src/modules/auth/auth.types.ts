import type { ProfileRole } from '../../generated/prisma/enums.js';
import type { Request } from 'express';

export type RequestUser = Readonly<{
  id: string;
  email: string;
  role: ProfileRole;
}>;

export type AuthenticatedRequest = Request & { user?: RequestUser };
