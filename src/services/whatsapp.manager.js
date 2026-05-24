import pkg from 'whatsapp-web.js';
import { rm } from 'fs/promises';
import { SYSTEM_CONFIG } from '../constant/TEXT.js';
import { MANAGER_RESPONSES } from '../constant/TEXT.js';
const { Client, LocalAuth } = pkg;

const sessions = {};
const WSM = "WSM Engine";
const KEEP_ALIVE_NUMBER = process.env.KEEP_ALIVE_NUMBER || SYSTEM_CONFIG.DEFAULT_KEEP_ALIVE_NUMBER;
const KEEP_ALIVE_INTERVAL = 30 * 60 * 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const clearChromiumLocks = async (clientIdRaw) => {
    const clientId = String(clientIdRaw).trim();
    const baseDir = `./sessions/storage-${clientId}/session`;

    const lockPaths = [
        `${baseDir}/SingletonLock`,
        `${baseDir}/SingletonCookie`,
        `${baseDir}/SingletonSocket`,
        `${baseDir}/DevToolsActivePort`,
        `${baseDir}/lockfile`,
        `${baseDir}/Default/LOCK`,
        `${baseDir}/Default/SingletonLock`
    ];

    try {
        for (const lockPath of lockPaths) {
            await rm(lockPath, { force: true });
        }
        console.log(`[${WSM}] [${clientId}] Candados de Chromium removidos.`);
    } catch (err) {
        console.warn(`[${WSM}] [${clientId}] Advertencia al limpiar candados:`, err.message);
    }
};

const startKeepAlive = (clientIdRaw) => {
    const clientId = String(clientIdRaw).trim();
    if (sessions[clientId]?.keepAliveTimer) {
        clearInterval(sessions[clientId].keepAliveTimer);
    }

    sessions[clientId].keepAliveTimer = setInterval(async () => {
        const session = sessions[clientId];
        if (!session || session.status !== SYSTEM_CONFIG.statuses.connected) return;

        try {
            const chatId = `${KEEP_ALIVE_NUMBER}@c.us`;
            const isRegistered = await session.instance.isRegisteredUser(chatId);
            
            if (!isRegistered) {
                throw new Error(MANAGER_RESPONSES.whatsappManager.kepAliveNotFound);
            }

            await session.instance.sendMessage(chatId, MANAGER_RESPONSES.whatsappManager.pinControl);
            console.log(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.kepAlive}`);
        } catch (error) {
            console.error(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.kepAliveFailed}`, error.message);
            await destoySessionInstance(clientId);
        }
    }, KEEP_ALIVE_INTERVAL);
};

const destoySessionInstance = async (clientIdRaw) => {
    const clientId = String(clientIdRaw).trim();
    const session = sessions[clientId];
    if (!session) return;

    if (session.keepAliveTimer) {
        clearInterval(session.keepAliveTimer);
    }

    session.status = SYSTEM_CONFIG.statuses.disconnected;

    try {
        if (session.instance) {
            await session.instance.destroy();
        }
    } catch (err) {
        console.error(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.errorInstanceDestroy}:`, err.message);
    }

    delete sessions[clientId];

    setTimeout(() => {
        initSession(clientId);
    }, 10000);
};

export const getSession = (clientIdRaw) => {
    const clientId = String(clientIdRaw).trim();
    return sessions[clientId] || null;
};

export const initSession = (clientIdRaw) => {
    const clientId = String(clientIdRaw).trim();
    if (sessions[clientId]) {
        return sessions[clientId];
    }

    console.log(`[${WSM}] ${MANAGER_RESPONSES.whatsappManager.initializingInstance} ${clientId}`);

    const clientInstance = new Client({
        authStrategy: new LocalAuth({ dataPath: `./sessions/storage-${clientId}` }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018244799-alpha.html'
        },
        puppeteer: {
            headless: true,
            handleSIGINT: false,
            handleSIGTERM: false,
            handleSIGHUP: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-gpu',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            ]
        }
    });

    sessions[clientId] = {
        instance: clientInstance,
        qr: "",
        status: SYSTEM_CONFIG.statuses.initializing,
        keepAliveTimer: null
    };

    clientInstance.on('qr', (qr) => {
        if (sessions[clientId]) {
            sessions[clientId].qr = qr;
            sessions[clientId].status = SYSTEM_CONFIG.statuses.qrReady;
            console.log(`[${WSM}] [${clientId}] QR listo.`);
        }
    });

    clientInstance.on('ready', () => {
        if (sessions[clientId]) {
            sessions[clientId].qr = "";
            sessions[clientId].status = SYSTEM_CONFIG.statuses.connected;
            console.log(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.connectReady}`);
            startKeepAlive(clientId);
        }
    });

    clientInstance.on('disconnected', async (reason) => {
        console.log(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.disconnected} ${reason}`);
        await destoySessionInstance(clientId);
    });

    const initializeWithRecovery = async () => {
        try {
            await clientInstance.initialize();
        } catch (err) {
            console.error(`[${WSM}] [${clientId}] ${MANAGER_RESPONSES.whatsappManager.iniatializeError}`, err.message);
            await destoySessionInstance(clientId);
        }
    };

    initializeWithRecovery();

    return sessions[clientId];
};

export const sendMediaToWhatsapp = async (clientId, number, media, textoMensaje) => {
    const session = getSession(clientId);
    if (!session || session.status !== SYSTEM_CONFIG.statuses.connected) {
        throw new Error(MANAGER_RESPONSES.whatsappManager.whatsappChanelNotConnected);
    }

    const chatId = `${number}@c.us`;

    try {
        const isRegistered = await session.instance.isRegisteredUser(chatId);
        if (!isRegistered) {
            const errorInvalido = new Error(MANAGER_RESPONSES.whatsappManager.invalidIdNumber);
            errorInvalido.isValidationError = true;
            throw errorInvalido;
        } 

        const delayEntreContactos = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
        await delay(delayEntreContactos);
        
        await session.instance.sendMessage(chatId, textoMensaje);
 
        const delayTextoYArchivo = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;
        await delay(delayTextoYArchivo);
 
        const response = await session.instance.sendMessage(chatId, media);
        console.log(`[${WSM}] Enviado con éxito a ${number}: ${media.filename}`);
        
        return response;
    } catch (puppeteerError) {
        console.error(`[${WSM}] Error detectado en transmision:`, puppeteerError.message);
        
        if (puppeteerError.isValidationError) {
            throw puppeteerError;
        }

        await destoySessionInstance(clientId);
        throw new Error(MANAGER_RESPONSES.whatsappManager.browserError);
    }
};
