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
        const session = await db.oAuthDB.startSession();

        try {
            session.startTransaction();

            const result = await this.oauthClientService.createClient(req.body, session);

            if (result.error) {
                throw new BadRequestError(
                    result.message || result.errorDetails || 'Failed to create OAuth client'
                );
            }

            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: result.message || 'OAuth client created successfully',
                data: result.data,
            });
        } catch (error: any) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    });
}
