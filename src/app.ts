import { requestLogger } from '@/Logger/requestLogger.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import corsOptions from '@/Config/corsOptions.js';

const app = express();

app.use(helmet());
app.use(requestLogger);
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

export default app;
