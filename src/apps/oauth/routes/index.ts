import { Router } from 'express';
import OAuthRouter from '@/apps/oauth/routes/OAuth.router.js';

const router = Router();

router.use(`/v1`, OAuthRouter);

export default router;
