import { processDispatchInvoice } from '../services/message.service.js';
import { API_RESPONSES } from '../constant/TEXT.js'; 

export const dispatchInvoice = async (req, res) => {
    const clientId = req.clientId;
    const { numero, cliente, archivoBase64 } = req.body;
  
    if (!numero || !archivoBase64 || !cliente) {
        return res.status(400).json({ 
            success: false, 
            message: API_RESPONSES.invoiceController.missingParameters 
        });
    }

    try {
        await processDispatchInvoice(clientId, { numero, cliente, archivoBase64 });

        return res.status(200).json({ 
            success: true, 
            message: `${API_RESPONSES.invoiceController.sendSuccess} desde la instancia ${clientId}` 
        });
        
    } catch (error) {
        console.error(error.message);

        const statusCode = error.isValidationError ? 400 : 500;
        return res.status(statusCode).json({ 
            success: false, 
            error: error.isValidationError ? error.message : API_RESPONSES.invoiceController.serverError,
            details: error.message 
        });
    }
};