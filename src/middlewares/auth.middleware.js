import { findClientByApiKey } from '../config/database.js';
import { API_RESPONSES } from '../constant/TEXT.js'; 

export const authenticateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ 
            success: false, 
            error: API_RESPONSES.authMiddleware.missingKey 
        });
    }

    try {
        const client = await findClientByApiKey(apiKey);
        
        if (!client) {
            return res.status(403).json({ 
                success: false, 
                error: API_RESPONSES.authMiddleware.invalidKey 
            });
        }
        
        req.clientId = client.id;
        req.clientName = client.name;
        next();
    } catch (error) {
        console.error(API_RESPONSES.authMiddleware.serverError, error.message);
        return res.status(500).json({ 
            success: false, 
            error: API_RESPONSES.authMiddleware.serverError 
        });
    }
};