import express from 'express';
import router from '@/apps/oauth/routes/index.js';

const oauthApp = express();
oauthApp.use('/', router);

export default oauthApp;
