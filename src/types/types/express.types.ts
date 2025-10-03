// types/express.d.ts
import { IUser } from '@/types/interfaces/User.interface';

declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser;
    }
}
