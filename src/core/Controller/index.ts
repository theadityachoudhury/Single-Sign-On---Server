import { NextFunction, Request, Response } from 'express';

export default abstract class BaseController {
    protected asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn.call(this, req, res, next)).catch(next);
        };
    }
}
