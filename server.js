import express from 'express';
import cors from 'cors';
import routerMedicos from './src/routes/message.routes.js';
import routerTenants from './src/routes/tenant.routes.js';
import { authenticateApiKey } from './src/middlewares/auth.middleware.js';
import { initSession } from './src/services/whatsapp.manager.js';
import { getAllClients } from './src/config/database.js'; 
import { SYSTEM_CONFIG } from './src/constant/TEXT.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/WSMessage', authenticateApiKey, routerMedicos);
app.use('/api/WSMessage/tenants', routerTenants); 


app.listen(PORT, async () => {
    console.log(`[Server] API montada con éxito corriendo en el puerto ${PORT}`);
    console.log(`[Server] Abre esta pagina  ` + SYSTEM_CONFIG.DEVELOPER_GITHUB_URL)
    console.log(`[Server] - Iniciando aprovisionamiento dinámico de contenedores WSM desde la DB...`);

    try {
        const tenants = await getAllClients();

        if (!tenants || tenants.length === 0) {
            console.log(`[Server] No se encontraron inquilinos activos en la base de datos para inicializar.`);
            return;
        }

        console.log(`[Server] Encontrados ${tenants.length} contenedores a inicializar.`);

        for (const tenant of tenants) {
            console.log(`[Server] Desplegando instancia automatizada para: ${tenant.name} (${tenant.id})`);

            initSession(tenant.id);

            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        console.log(`[Server] Todos los contenedores de la base de datos han sido despachados al motor de ejecución.`);

    } catch (error) {
        console.error(`[Server] Error crítico durante la auto-inicialización del ecosistema WSM:`, error.message);
    }
});