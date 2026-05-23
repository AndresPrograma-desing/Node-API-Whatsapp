import { API_RESPONSES } from '../constant/TEXT.js';
import * as whatsappManager from '../services/whatsapp.manager.js';

export const connectClient = (req, res) => {
    const clientId = req.clientId;
    const session = whatsappManager.initSession(clientId);

    return res.status(200).json({
        success: true,
        message: API_RESPONSES.status.isRunning,
        status: session.status
    });
};

export const checkStatus = (req, res) => {
    const clientId = req.clientId;
    const session = whatsappManager.getSession(clientId);

    if (!session) {
        return res.status(200).json({ status: API_RESPONSES.status.notInitialized, qr: "" });
    }

    return res.status(200).json({
        status: session.status,
        qr: session.qr 
    });
};