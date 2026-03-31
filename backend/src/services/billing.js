const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function ensureBillsDir() {
  const dir = path.join(__dirname, '..', '..', 'bills');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function formatMoney(n) {
  return `₹${Number(n).toFixed(0)}`;
}

function drawDashedLine(doc, y) {
  const startX = 50;
  const endX = doc.page.width - 50;
  const dashLength = 3;
  const gapLength = 3;
  
  for (let x = startX; x < endX; x += dashLength + gapLength) {
    doc.moveTo(x, y).lineTo(Math.min(x + dashLength, endX), y).stroke();
  }
}

async function generateBillPdf({ orderId, tableNumber, createdAt, items, subTotal, gstRate, gstAmount, grandTotal }) {
  const billsDir = ensureBillsDir();
  const fileName = `bill_${orderId}.pdf`;
  const filePath = path.join(billsDir, fileName);
  
  const possibleQrPaths = [
    path.join(__dirname, '..', '..', 'QR.jpeg'),
    path.join(__dirname, '..', '..', '..', 'QR.jpeg'),
    path.join(process.cwd(), 'QR.jpeg'),
    path.join(process.cwd(), 'backend', 'QR.jpeg')
  ];
  
  const qrPath = possibleQrPaths.find(p => fs.existsSync(p)) || possibleQrPaths[0];

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.on('error', reject);
    stream.on('error', reject);
    stream.on('finish', resolve);

    doc.pipe(stream);

    doc.fontSize(24).font('Helvetica-Bold').text('DesiDera', { align: 'center' });
    doc.moveDown(0.3);
    
    doc.fontSize(11).font('Helvetica').text('Sriganda Palace', { align: 'center' });
    doc.fontSize(10).text('Service Rd, T K Reddy Layout, Annaiah Reddy Layout,', { align: 'center' });
    doc.text('Banaswadi, Bengaluru, Karnataka 560043', { align: 'center' });
    doc.fontSize(9).text('GST No 29ADDPR8125K1Z2', { align: 'center' });
    
    doc.moveDown(1);
    let currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica-Bold').text('RECEIPT', { align: 'center' });
    doc.moveDown(0.5);
    
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.8);

    const invoiceNumber = orderId.toString().slice(-4);
    const dateStr = new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: Guest`, 50, doc.y, { continued: true, width: 250 });
    doc.text(`Invoice No: ${invoiceNumber}`, { align: 'right' });
    
    doc.text(`Table: #${tableNumber}`, 50, doc.y, { continued: true, width: 250 });
    doc.text(`Date: ${dateStr}`, { align: 'right' });
    
    doc.moveDown(0.8);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold');
    const headerY = doc.y;
    doc.text('Item', 50, headerY, { width: 200 });
    doc.text('Price', 350, headerY, { width: 80, align: 'right' });
    doc.text('Qty', 450, headerY, { width: 50, align: 'right' });
    doc.text('Total', 500, headerY, { width: 45, align: 'right' });
    
    doc.moveDown(0.5);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.5);

    doc.font('Helvetica');
    items.forEach((it) => {
      const rowY = doc.y;
      
      doc.text(it.name, 50, rowY, { width: 280 });
      doc.y = rowY;
      
      doc.text(formatMoney(it.unitPrice), 350, rowY, { width: 80, align: 'right' });
      doc.y = rowY;
      
      doc.text(String(it.quantity), 450, rowY, { width: 50, align: 'right' });
      doc.y = rowY;
      
      doc.text(formatMoney(it.lineTotal), 500, rowY, { width: 45, align: 'right' });
      
      doc.y = rowY + 18;
    });

    doc.moveDown(0.3);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.8);

    doc.fontSize(10);
    let summaryY = doc.y;
    doc.text('Sub-Total:', 350, summaryY, { width: 100, align: 'right' });
    doc.text(formatMoney(subTotal), 460, summaryY, { width: 85, align: 'right' });

    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const gstPercent = (gstRate * 100).toFixed(1);

    summaryY += 15;
    doc.text(`CGST:`, 350, summaryY, { width: 100, align: 'right' });
    doc.text(`${gstPercent}% ${formatMoney(cgstAmount)}`, 460, summaryY, { width: 85, align: 'right' });

    summaryY += 15;
    doc.text(`SGST:`, 350, summaryY, { width: 100, align: 'right' });
    doc.text(`${gstPercent}% ${formatMoney(sgstAmount)}`, 460, summaryY, { width: 85, align: 'right' });
    
    doc.y = summaryY + 15;

    doc.moveDown(0.3);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica-Bold');
    const totalY = doc.y;
    doc.text('Mode: Cash/Online', 350, totalY, { width: 110, align: 'right' });
    doc.text(`Total: ${formatMoney(grandTotal)}`, 460, totalY, { width: 85, align: 'right' });
    doc.y = totalY + 20;

    doc.moveDown(0.8);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Oblique').text('**SAVE PAPER SAVE NATURE !!', { align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Time: ${timeStr}`, { align: 'center' });

    doc.moveDown(0.8);
    currentY = doc.y;
    drawDashedLine(doc, currentY);
    doc.moveDown(1.5);

    if (fs.existsSync(qrPath)) {
      const qrSize = 120;
      const qrX = (doc.page.width - qrSize) / 2;
      doc.image(qrPath, qrX, doc.y, { width: qrSize, height: qrSize });
      doc.moveDown(8);
    }

    doc.fontSize(11).font('Helvetica-Bold').text('We Value Your Feedback! * * * * *', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica').text('Please take a moment to share your dining experience with us.', { align: 'center' });
    doc.moveDown(0.3);
    
    const feedbackUrl = `${process.env.PUBLIC_BASE_URL || 'https://desi-dera.vercel.app'}/feedback`;
    doc.fontSize(9).fillColor('blue').text(feedbackUrl, { align: 'center', underline: true, link: feedbackUrl });
    
    doc.moveDown(0.8);
    doc.fillColor('black').fontSize(10).font('Helvetica-Oblique').text('Thank you for dining with DesiDera!', { align: 'center' });
    doc.fontSize(9).text('We hope to serve you again soon.', { align: 'center' });

    doc.end();
  });

  return { fileName, filePath };
}

module.exports = { generateBillPdf };
