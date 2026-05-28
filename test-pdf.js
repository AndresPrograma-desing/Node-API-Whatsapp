import { generateFlexibleInvoice } from './utils/invoicePDFGeneratorA2.js';
import { SYSTEM_CONFIG } from './src/constant/TEXT.js'; 


const mockData = {
    invoiceId: "FAC-DUMMY-001",
    dates: {
        emission: "00/00/00",
        expiration: "11/22/3333"
    },
    emitter: {
        companyName: SYSTEM_CONFIG.SYSTEM_NAME_DEFAULT,
        taxId: "J-40291185-3",
        address: SYSTEM_CONFIG.DEVELOPER_GITHUB_URL,
        phone: "+58 212-555-1234",
        email: "contacto@" + SYSTEM_CONFIG.SYSTEM_NAME_DEFAULT.toLowerCase().replace(/\s+/g, '') + ".com"
    },
    client: {
        fullName: SYSTEM_CONFIG.SYSTEM_NAME_DEFAULT,
        taxId: "V-29361132",
        address: SYSTEM_CONFIG.DEVELOPER_GITHUB_URL
    },
    payment: {
        method: "Transferencia Bancaria",
        currency: "USD",
        currencySymbol: "$",
        accountNumber: "TX-77401-BK",
        taxPercentage: 16
    },
    items: [
        {
            name: "Tarjeta gráfica RTX 4090",
            qty: 1,
            price: 450.00
        }
    ],
    legalNotes: "Documento fiscal válido. Pago neto a la cuenta del emisor. WSMessage.dev certifica la entrega digital."
};

async function ejecutar() {


    try {
        console.log("Procesando plantilla dinámica para factura.");
         
        const fileOutput = 'pdf/invoice_test.pdf';
        await generateFlexibleInvoice(fileOutput, mockData);
        
        console.log(`Archivo listo para enviar por WhatsApp en: ${fileOutput}`);
    } catch (error) {
        console.error("Error al procesar la plantilla dinámica:", error.message);
    }
}

ejecutar();