import { validateWith } from '@/core/Middlewares/index.js';
import { Router } from 'express';
import { createOAuthClientSchema } from '@/apps/oauth/schema/OAuthClients.schema.js';

const OAuthClientRouter = Router();
import { OAuthClientController } from '@/apps/oauth/controllers/OAuthClient.controller.js';
const oauthClientController = new OAuthClientController();

OAuthClientRouter.post(
    '/',
    validateWith(createOAuthClientSchema),
    oauthClientController.createClient
);

export default OAuthClientRouter;
