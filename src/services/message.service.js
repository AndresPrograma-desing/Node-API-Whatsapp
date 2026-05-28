import pkg from 'whatsapp-web.js';
import { sendMediaToWhatsapp, initSession, getSession } from './whatsapp.manager.js';
import { getAllClients } from '../config/database.js';
import { getText } from '../constant/TEXT.js';
import { generateFlexibleInvoice } from '../../utils/invoicePDFGeneratorA2.js'; 
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import appSettings from '../../config/appsettings.json' with { type: 'json' };

const { MessageMedia } = pkg;
 
const pdfDir = path.resolve(`./${appSettings.pdfSettings.folderName}`);
if (!existsSync(pdfDir)) {
    mkdirSync(pdfDir, { recursive: true });
}

const cleanPhoneNumber = (number) => {
    if (!number) return '';
    return number.replace(/\D/g, '');
};

export const processAndSendInvoice = async (clientId, payload, req) => {
    const { numero, cliente, Url, nombreEmpresa, mensaje, invoiceData } = payload;
    const numeroNormalizado = cleanPhoneNumber(numero);

    let media;
    let isGeneratedInvoice = false;
    let fileName = '';
    let downloadUrl = '';

    if (invoiceData && Object.keys(invoiceData).length > 0) {
        isGeneratedInvoice = true;
        fileName = `factura-${invoiceData.invoiceId || Date.now()}.pdf`;
        const outputPath = path.join(pdfDir, fileName);

        await generateFlexibleInvoice(outputPath, invoiceData);

        if (req) {
            const forwardedHost = req.headers['x-forwarded-host'];
            const host = forwardedHost || req.get('host');
            const forwardedProto = req.headers['x-forwarded-proto'];
            const protocol = forwardedProto || req.protocol;
            
            downloadUrl = `${protocol}://${host}/pdf/${fileName}`;
        }

        const buffer = await fs.readFile(outputPath);
        media = new MessageMedia('application/pdf', buffer.toString('base64'), `Factura_${invoiceData.invoiceId}.pdf`);

    } else {
        const respuesta = await fetch(Url);
        if (!respuesta.ok) {
            throw new Error(respuesta.status);
        }

        const mimeType = respuesta.headers.get('content-type') || 'application/octet-stream';

        const parsedUrl = new URL(Url);
        const pathSegments = parsedUrl.pathname.split('/');
        let nombreArchivo = pathSegments[pathSegments.length - 1];

        if (!nombreArchivo || !nombreArchivo.includes('.')) {
            nombreArchivo = `Archivo_${cliente.replace(/\s+/g, '_')}.pdf`;
        }

        const arrayBuffer = await respuesta.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        media = new MessageMedia(mimeType, buffer.toString('base64'), nombreArchivo);
    }

    const textoPersonalizado = getText("WS_Message.Dev", {
        name: cliente,
        companyName: nombreEmpresa,
        message: mensaje
    });

    await sendMediaToWhatsapp(clientId, numeroNormalizado, media, textoPersonalizado);

    if (isGeneratedInvoice) {
        const TIEMPO_EXPIRACION = appSettings.pdfSettings.expirationMinutes * 60 * 1000;
        
        setTimeout(async () => {
            try {
                const filePathToDel = path.join(pdfDir, fileName);
                if (existsSync(filePathToDel)) {
                    await fs.unlink(filePathToDel);
                }
            } catch (err) {
            }
        }, TIEMPO_EXPIRACION);
        return { downloadUrl };
    }

    return {};
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