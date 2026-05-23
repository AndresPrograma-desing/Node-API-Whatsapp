import crypto from 'crypto';
import { createNewTenant } from '../config/database.js';
import { SERVICES_RESPONSES } from '../constant/TEXT.js';

export const registerNewTenantService = async (id, name) => {
    const idRegex = /^[a-z0-9_]+$/;
    if (!idRegex.test(id)) {
        throw new Error(SERVICES_RESPONSES.tenantService.invalidId);
    }

    const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-_()]+$/;
    if (!nameRegex.test(name)) {
        throw new Error(SERVICES_RESPONSES.tenantService.invalidName);
    }

    const prefijo = name
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra[0])
        .join('')
        .replace(/[^a-z0-9]/g, '');

    const cadenaAleatoria = crypto.randomBytes(12).toString('hex');
    const apiKeyGenerada = `${prefijo}_live_${cadenaAleatoria}`;

    const tenantCreado = await createNewTenant(id, name, apiKeyGenerada);
    
    if (!tenantCreado) {
        throw new Error(SERVICES_RESPONSES.tenantService.registrationError);
    }

    return tenantCreado;
};