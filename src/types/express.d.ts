// Type augmentation for Express
import { User } from '@/entities/user.entity';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
        userId?: string;
    }
}
