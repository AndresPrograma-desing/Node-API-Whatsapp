import fs from 'fs';
import PDFDocument from 'pdfkit';
import { INVOICE_GENERATOR } from '../src/constant/TEXT.js';


export const generateFlexibleInvoice = async (outputPath, data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true
        });
        const symbol = data.payment.currencySymbol  || '$';

        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        const PRIMARY = '#1e3a8a';
        const PRIMARY_LIGHT = '#dbeafe';
        const TEXT_DARK = '#111827';
        const TEXT_MUTED = '#4b5563';
        const BORDER = '#e5e7eb';
        const ROW_ALT = '#f9fafb';
        const WHITE = '#ffffff';

        const leftWidth = 280;
        const rightWidth = 210;
        const headerStartY = 65;

        doc.font('Helvetica-Bold').fontSize(18);
        const nameHeight = doc.heightOfString(data.emitter.companyName.toUpperCase(), { width: leftWidth });

        doc.font('Helvetica').fontSize(8);
        const idHeight = doc.heightOfString(`ID: ${data.emitter.taxId} | ${data.emitter.address}`, { width: leftWidth });
        const emailHeight = doc.heightOfString(`Email: ${data.emitter.email} | Tel: ${data.emitter.phone}`, { width: leftWidth });
        const totalLeftHeight = nameHeight + 5 + idHeight + emailHeight;

        doc.font('Helvetica-Bold').fontSize(11);
        const facturaHeight = doc.heightOfString('FACTURA', { width: rightWidth });
        doc.font('Helvetica').fontSize(9);
        const numHeight = doc.heightOfString(`Nº ${data.invoiceId}`, { width: rightWidth });
        doc.font('Helvetica').fontSize(8);
        const emissionHeight = doc.heightOfString(`Fecha Emisión: ${data.dates.emission}`, { width: rightWidth });
        const expirationHeight = doc.heightOfString(`Vencimiento: ${data.dates.expiration}`, { width: rightWidth });
        const totalRightHeight = facturaHeight + numHeight + emissionHeight + expirationHeight;

        const contentMaxHeight = Math.max(totalLeftHeight, totalRightHeight);
        const panelHeight = contentMaxHeight + 25;

        doc.rect(50, 50, 495, panelHeight).fill(PRIMARY);

        doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE)
           .text(data.emitter.companyName.toUpperCase(), 65, headerStartY, { width: leftWidth });
        doc.font('Helvetica').fontSize(8).fillColor(WHITE)
           .text(`ID: ${data.emitter.taxId} | ${data.emitter.address}`, 65, doc.y + 5, { width: leftWidth });
        doc.text(`Email: ${data.emitter.email} | Tel: ${data.emitter.phone}`, 65, doc.y, { width: leftWidth });

        doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE)
           .text('FACTURA', 320, headerStartY, { align: 'right', width: rightWidth });
        doc.font('Helvetica').fontSize(9).fillColor(WHITE)
           .text(`Nº ${data.invoiceId}`, 320, doc.y, { align: 'right', width: rightWidth });
        doc.fontSize(8).fillColor(WHITE)
           .text(`Fecha Emisión: ${data.dates.emission}`, 320, doc.y, { align: 'right', width: rightWidth });
        doc.text(`Vencimiento: ${data.dates.expiration}`, 320, doc.y, { align: 'right', width: rightWidth });

        const infoY = 50 + panelHeight + 20;

        doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY)
           .text('DATOS DEL CLIENTE', 50, infoY, { width: 250 });
        doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_DARK)
           .text(data.client.fullName, 50, doc.y + 4, { width: 250 });
        doc.font('Helvetica').fontSize(9).fillColor(TEXT_MUTED)
           .text(`ID Fiscal: ${data.client.taxId}`, 50, doc.y, { width: 250 });
        doc.text(`Dirección: ${data.client.address}`, 50, doc.y, { width: 250 });
        const clientBottom = doc.y;

        doc.font('Helvetica-Bold').fontSize(10).fillColor(PRIMARY)
           .text('DETALLES DE PAGO', 320, infoY, { align: 'right', width: 225 });
        doc.font('Helvetica').fontSize(9).fillColor(TEXT_MUTED)
           .text(`Método: ${data.payment.method}`, 320, doc.y + 4, { align: 'right', width: 225 });
        doc.text(`Moneda: ${data.payment.currency}`, 320, doc.y, { align: 'right', width: 225 });
        if (data.payment.accountNumber) {
            doc.text(`Cuenta: ${data.payment.accountNumber}`, 320, doc.y, { align: 'right', width: 225 });
        }
        const paymentBottom = doc.y;

        let tableY = Math.max(clientBottom, paymentBottom) + 25;

        doc.rect(50, tableY, 495, 20).fill(PRIMARY);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(WHITE);
        doc.text('Descripción', 60, tableY + 5, { width: 260 });
        doc.text('Cant.', 330, tableY + 5, { width: 40, align: 'center' });
        doc.text('Precio Unit.', 385, tableY + 5, { width: 75, align: 'right' });
        doc.text('Total', 470, tableY + 5, { width: 65, align: 'right' });

        tableY += 20;
        let subtotal = 0;

        data.items.forEach((item, index) => {
            const rowTotal = item.qty * item.price;
            subtotal += rowTotal;

            const rowHeight = 22;
            const bgColor = index % 2 === 0 ? WHITE : ROW_ALT;
            doc.rect(50, tableY, 495, rowHeight).fill(bgColor);

            doc.font('Helvetica').fontSize(8.5).fillColor(TEXT_DARK);
            doc.text(item.name, 60, tableY + 4, { width: 260 });
            doc.text(item.qty.toString(), 330, tableY + 4, { width: 40, align: 'center' });
            doc.text(`${symbol}${item.price.toFixed(2)}`, 385, tableY + 4, { width: 75, align: 'right' });
            doc.text(`${symbol}${rowTotal.toFixed(2)}`, 470, tableY + 4, { width: 65, align: 'right' });

            doc.moveTo(50, tableY + rowHeight).lineTo(545, tableY + rowHeight)
               .lineWidth(0.3).stroke(BORDER);
            tableY += rowHeight;
        });

        const taxPercent = data.payment.taxPercentage || 0;
        const totalTax = subtotal * (taxPercent / 100);
        const totalNeto = subtotal + totalTax;

        let totalsY = tableY + 15;

        doc.font('Helvetica').fontSize(9).fillColor(TEXT_MUTED);
        doc.text('Subtotal', 380, totalsY, { width: 90, align: 'right' });
        doc.font('Helvetica-Bold').fillColor(TEXT_DARK)
           .text(`${symbol}${subtotal.toFixed(2)}`, 475, totalsY, { width: 60, align: 'right' });

        totalsY += 16;
        doc.font('Helvetica').fillColor(TEXT_MUTED)
           .text(`Impuesto (${taxPercent}%)`, 380, totalsY, { width: 90, align: 'right' });
        doc.font('Helvetica-Bold').fillColor(TEXT_DARK)
           .text(`${symbol}${totalTax.toFixed(2)}`, 475, totalsY, { width: 60, align: 'right' });

        totalsY += 18;
        doc.moveTo(380, totalsY).lineTo(545, totalsY).lineWidth(0.8).stroke(PRIMARY);
        totalsY += 4;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY)
           .text('TOTAL NETO', 380, totalsY, { width: 90, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY)
           .text(`${symbol}${totalNeto.toFixed(2)}`, 475, totalsY, { width: 60, align: 'right' });

        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.moveTo(50, 770).lineTo(545, 770).lineWidth(0.5).stroke(BORDER);
            doc.font('Helvetica').fontSize(7.5).fillColor(TEXT_MUTED);
            doc.text(
                `${INVOICE_GENERATOR.footer} · Página ${i + 1} de ${pages.count}`,
                50,
                778,
                { align: 'center', width: 495 }
            );
        }

        doc.end();

        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', (err) => reject(err));
    });
};