import { Router } from 'express';
import OAuthClientRouter from '@/apps/oauth/routes/OAuth.router.js';

const router = Router();

router.use(`/v1/clients`, OAuthClientRouter);

export default router;
