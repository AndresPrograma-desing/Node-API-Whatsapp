import { Router } from 'express';
import { registerTenantController } from '../controllers/tenant.controller.js';
import { ROUTES_TEXT } from '../constant/ROUTES_TEXT.js';

const router = Router();

router.post(ROUTES_TEXT.tenantRoute.register, registerTenantController);

export default router;