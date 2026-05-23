import { Router } from 'express';
import { connectClient, checkStatus } from '../controllers/session.controller.js';

const router = Router();

router.post('/connect', connectClient);
router.get('/status', checkStatus);

export default router;