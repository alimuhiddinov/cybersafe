import { LearningModule, User, UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
      module?: LearningModule;
    }
  }
}
