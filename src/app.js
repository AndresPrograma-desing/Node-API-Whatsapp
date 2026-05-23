import express from 'express';
import cors from 'cors';
import { authenticateApiKey } from './middlewares/auth.middleware.js';
import sessionRoutes from './routes/session.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/WSMessage', authenticateApiKey, sessionRoutes);
app.use('/api/WSMessage', authenticateApiKey, messageRoutes);

export default app;