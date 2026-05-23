import { registerNewTenantService } from '../services/tenant.service.js';
import { API_RESPONSES } from '../constant/TEXT.js';

export const registerTenantController = async (req, res) => {
    try {
        let { id, name } = req.body;

        if (!id || !name || !id.trim() || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: API_RESPONSES.tenantController.missingFields
            });
        }

        const nuevoTenant = await registerNewTenantService(id.trim(), name.trim());

        return res.status(201).json({
            success: true,
            message: API_RESPONSES.tenantController.registerSuccess,
            data: nuevoTenant
        });

    } catch (error) {
        console.error(API_RESPONSES.tenantController.serverError, error.message);

        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};