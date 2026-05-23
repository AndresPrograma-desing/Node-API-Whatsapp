import pkg from 'whatsapp-web.js';
import { sendMediaToWhatsapp, initSession, getSession } from './whatsapp.manager.js';
import { getAllClients } from '../config/database.js';
import { getText } from '../constant/TEXT.js';

const { MessageMedia } = pkg;

const cleanPhoneNumber = (number) => {
    if (!number) return '';
    return number.replace(/\D/g, '');
};

export const processAndSendInvoice = async (clientId, payload) => {
    const { numero, cliente, pdfUrl, nombreEmpresa, mensaje } = payload;
    const numeroNormalizado = cleanPhoneNumber(numero);

    const respuesta = await fetch(pdfUrl);
    if (!respuesta.ok) {
        throw new Error(respuesta.status);
    }

    const mimeType = respuesta.headers.get('content-type') || 'application/octet-stream';

    const parsedUrl = new URL(pdfUrl);
    const pathSegments = parsedUrl.pathname.split('/');
    let nombreArchivo = pathSegments[pathSegments.length - 1];

    if (!nombreArchivo || !nombreArchivo.includes('.')) {
        nombreArchivo = `Archivo_${cliente.replace(/\s+/g, '_')}.pdf`;
    }

    const arrayBuffer = await respuesta.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const media = new MessageMedia(mimeType, buffer.toString('base64'), nombreArchivo);

    const textoPersonalizado = getText("WS_Message.Dev", {
        name: cliente,
        companyName: nombreEmpresa,
        message: mensaje
    });

    await sendMediaToWhatsapp(clientId, numeroNormalizado, media, textoPersonalizado);
    return true;
};

export const processDispatchInvoice = async (clientId, payload) => {
    const { numero, cliente, archivoBase64 } = payload;
    const numeroNormalizado = cleanPhoneNumber(numero);
    const cleanFilename = `Documento_${cliente.replace(/\s+/g, '_')}.pdf`;
    
    const media = new MessageMedia('application/pdf', archivoBase64, cleanFilename);
    const textoInformativo = `Hola ${cliente}, adjuntamos su documento.`;
    
    await sendMediaToWhatsapp(clientId, numeroNormalizado, media, textoInformativo);
    return true;
};

export const startTenantSession = (clientId) => {
    return initSession(clientId);
};

export const checkTenantStatus = (clientId) => {
    return getSession(clientId);
};

export const fetchAllRegisteredClients = async () => {
    return await getAllClients();
};