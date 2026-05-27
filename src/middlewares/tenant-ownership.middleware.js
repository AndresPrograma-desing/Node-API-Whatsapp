import { doesApiKeyBelongToClient } from '../config/database.js';
import { API_RESPONSES } from '../constant/TEXT.js';

export const validateClientOwnershipByApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const { clientId } = req.body;

    if (!clientId || !String(clientId).trim()) {
        return res.status(400).json({
            success: false,
            error: API_RESPONSES.authMiddleware.missingClientIdBody
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: API_RESPONSES.authMiddleware.missingKey
        });
    }

    try {
        const belongs = await doesApiKeyBelongToClient(String(clientId).trim(), String(apiKey).trim());

        if (!belongs) {
            return res.status(403).json({
                success: false,
                error: API_RESPONSES.authMiddleware.clientMismatch
            });
        }

        next();
    } catch (error) {
        console.error(API_RESPONSES.authMiddleware.serverError, error.message);
        return res.status(500).json({
            success: false,
            error: API_RESPONSES.authMiddleware.serverError
        });
    }
};
