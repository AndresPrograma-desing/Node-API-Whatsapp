import { Router } from 'express';
import { processAndSendInvoice, startTenantSession, checkTenantStatus, fetchAllRegisteredClients } from '../services/message.service.js';
import { API_RESPONSES, SYSTEM_CONFIG } from '../constant/TEXT.js';
import { authenticateApiKey } from '../middlewares/auth.middleware.js';
import { ROUTES_TEXT } from '../constant/ROUTES_TEXT.js';

const router = Router();

router.post(ROUTES_TEXT.messageRoute.sendInvoice, async (req, res) => { 
    try {
        const { clientId: bodyClientId, numero, cliente, url: url, nombreEmpresa, mensaje } = req.body;

        if (!numero || !url || !cliente || !nombreEmpresa) {
            return res.status(400).json({ 
                success: false, 
                error: API_RESPONSES.invoiceController.missingParameters 
            });
        }

        const clientId = bodyClientId || req.clientId || SYSTEM_CONFIG.DEFAULT_CLIENT_ID; 

        await processAndSendInvoice(clientId, { numero, cliente, url: url, nombreEmpresa, mensaje });

        return res.json({
            success: true,
            message: `${API_RESPONSES.invoiceController.sendSuccess} desde la instancia ${clientId}`
        });

    } catch (error) {
        console.error(error.message);
        
        const statusCode = error.isValidationError ? 400 : 500;
        return res.status(statusCode).json({ 
            success: false, 
            error: error.isValidationError ? error.message : `${API_RESPONSES.invoiceController.serverError} ${error.message}` 
        });
    }
});

router.post(ROUTES_TEXT.messageRoute.initSession, (req, res) => {
    try {
        const { clientId } = req.body;
        if (!clientId) {
            return res.status(400).json({ 
                success: false, 
                error: API_RESPONSES.initSession.missingClientId 
            });
        }

        const session = startTenantSession(clientId);
        return res.json({ success: true, status: session.status });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get(ROUTES_TEXT.messageRoute.status, (req, res) => {
    try {
        const { clientId } = req.params;
        const session = checkTenantStatus(clientId);

        if (!session) {
            return res.status(404).json({
                clientId,
                status: API_RESPONSES.status.notInitialized, 
                qr: ""
            });
        }

        return res.json({
            clientId,
            status: session.status,
            qr: session.qr || ""
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get(ROUTES_TEXT.messageRoute.clientList, authenticateApiKey, async (req, res) => {
    try {
        const clientes = await fetchAllRegisteredClients();

        if (!clientes) {
            return res.status(500).json({
                success: false,
                error: API_RESPONSES.clientsController.serverError
            });
        }

        return res.json({
            success: true,
            message: API_RESPONSES.clientsController.fetchSuccess,
            count: clientes.length,
            data: clientes
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ 
            success: false, 
            error: API_RESPONSES.clientsController.serverError 
        });
    }
});

export default router;    