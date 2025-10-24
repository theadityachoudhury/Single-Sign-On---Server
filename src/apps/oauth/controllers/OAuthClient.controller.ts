import BaseController from '@/core/Controller/index.js';
import { Request, Response } from 'express';
import { db } from '@/core/DB/index.js';
import OAuthClientService from '@/apps/oauth/services/OAuthClient.service.js';
import { BadRequestError } from '@/core/Middlewares/ErrorHandler.js';

export class OAuthClientController extends BaseController {
    private oauthClientService: OAuthClientService;

    constructor() {
        super();
        this.oauthClientService = new OAuthClientService();
    }

    createClient = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
        // In test environment (or when transactions are not supported), skip session/transaction
        const useTransaction = process.env.NODE_ENV !== 'test';
        const session = useTransaction ? await db.oAuthDB.startSession() : undefined;

        try {
            if (session) session.startTransaction();

            const result = await this.oauthClientService.createClient(req.body, session);

            if (result.error) {
                throw new BadRequestError(
                    result.message || result.errorDetails || 'Failed to create OAuth client'
                );
            }

            if (session) await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: result.message || 'OAuth client created successfully',
                data: result.data,
            });
        } catch (error: any) {
            if (session) await session.abortTransaction();
            throw error;
        } finally {
            if (session) session.endSession();
        }
    });
}
