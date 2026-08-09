import { Papel } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  papel: Papel;
}
