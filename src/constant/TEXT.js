import { disconnect } from "cluster";
import { connect } from "http2";

export const ABREVIATION_API = "WSM";
export const VERSION = "V1";

export const SYSTEM_CONFIG = {
    DEFAULT_CLIENT_ID: "client_default_0",
    SYSTEM_NAME_DEFAULT: "WSMessage.Dev",
    DEVELOPER_GITHUB_URL: "https://github.com/AndresPrograma-desing",
    DEFAULT_KEEP_ALIVE_NUMBER: 1234567890,

    statuses: {
        connecting: "CONNECTING",
        connected: "CONNECTED",
        disconnecting: "DISCONNECTING",
        disconnected: "DISCONNECTED",
        qrReady: "QR_READY",

    }
};

export const API_RESPONSES = {
    invoiceController: {
        missingParameters: "Faltan parámetros obligatorios (numero, cliente, url o nombreEmpresa).",
        sendSuccess: "Mensaje de texto personalizado y PDF entregados de forma exitosa.",
        fetchError: "No se pudo descargar el archivo desde la URL. Status: ",
        serverError: "Error interno al procesar el envío en el servidor."
    },
    initSession: {
        missingClientId: "Falta el clientId"
    },
    status: {
        notInitialized: "NOT INITIALIZED",
        initializing: "INITIALIZING",
        ready: "READY",
        error: "ERROR",
        isRunning: "Instancia arrancada."
    },
    authMiddleware: {
        missingKey: "Acceso denegado. Falta la cabecera 'x-api-key'.",
        invalidKey: "API Key inválida o suspendida.",
        serverError: "Error en la capa de autenticación."
    },
    clientsController: {
        fetchSuccess: "Lista de clientes obtenida con éxito.",
        serverError: "Error interno al recuperar el listado de clientes."
    },
    tenantController: {
        missingFields: "Los campos 'id' y 'name' son obligatorios y no pueden estar vacíos.",
        registerSuccess: "Su sistema ha sido registrado y validado con éxito.",
        serverError: "Error interno al registrar el nuevo tenant."
    },
    authMiddleware: {
        missingKey: "Acceso denegado. Falta la cabecera 'x-api-key'.",
        invalidKey: "API Key inválida o suspendida.",
        serverError: "Error en la capa de autenticación."
    }

};
export const Db_Responses = {
    envError: '[Error Crítico] Faltan las variables SUPABASE_URL o SUPABASE_KEY en el archivo .env',
    queryError: 'Error al consultar tabla tenants en Supabase:',
    findClientError: 'Error crítico en findClientByApiKey:',
    getAllClientsError: 'Error crítico en getAllClients:',
    createTenantError: 'Error crítico en createNewTenant:',
}
export const SERVICES_RESPONSES = {
    tenantService: {
        invalidId: "El 'id' es inválido. Solo se permiten letras minúsculas, números y guiones bajos.",
        invalidName: "El 'name' contiene caracteres no permitidos. Use solo letras, números y espacios.",
        registrationError: "No se pudo registrar la veterinaria en la base de datos."
    }
};

export const MANAGER_RESPONSES = {
    whatsappManager: {
        kepAlive: "Keep-alive enviado con éxito.",
        kepAliveNotFound: "El numero de control keep-alive no es valido.",
        kepAliveFailed: "Falló el keep-alive, reiniciando canal.",
        pinControl: "Ping de control del sistema para mantener la sesión activa.",
        sessionNotFound: "No se encontró una sesión activa para el clientId proporcionado.",
        notConnected: "El canal de WhatsApp no se encuentra conectado.",
        sendError: "Error al enviar el mensaje a través de WhatsApp.",
        errorInstanceDestroy: "Error al destruir la instancia de sesión: ",
        initializingInstance: "Inicializando nueva instancia para: ",
        connectReady: "Conectado y listo.",
        disconnected: "Desconectado por WhatsApp: ",
        iniatializeError: "Error atrapado en inicializacion: ",
        whatsappChanelNotConnected: "El canal de WhatsApp no se encuentra conectado.",
        invalidIdNumber: "El número de teléfono proporcionado no es válido para WhatsApp.",
        browserError: "Error interno en la ejecución del navegador remoto."
    }
};

export function getText(key, data = {}) {
    const { name, companyName, message } = data;

    const empresaEmisora = companyName || SYSTEM_CONFIG.SYSTEM_NAME_DEFAULT;
    const mensajeCuerpo = message || "Queremos informarte que tu documentación digital ya se encuentra disponible.";

    const texts = {
        "WS_Message.Dev":
            `👋 Hola, *${name}*!

🏢 *${empresaEmisora}* le informa:
${mensajeCuerpo}

📄 _Hemos adjuntado el archivo PDF correspondiente a este mensaje para su comodidad y descarga._

------------------------------------------
📩 Mensaje enviado a través de:
🚀 *WSMessage* ➔ ${SYSTEM_CONFIG.DEVELOPER_GITHUB_URL}`
    };

    return texts[key] || `👋 Hola, *${name}*. Documento entregado por *${empresaEmisora}*.`;
}