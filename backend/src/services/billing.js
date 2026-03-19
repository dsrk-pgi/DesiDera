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
  return `₹${Number(n).toFixed(2)}`;
}

async function generateBillPdf({ orderId, tableNumber, createdAt, items, subTotal, gstRate, gstAmount, grandTotal }) {
  const billsDir = ensureBillsDir();
  const fileName = `bill_${orderId}.pdf`;
  const filePath = path.join(billsDir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.on('error', reject);
    stream.on('error', reject);
    stream.on('finish', resolve);

    doc.pipe(stream);

    doc.fontSize(20).text('DesiDera - Bill', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${orderId}`);
    doc.text(`Table: ${tableNumber}`);
    doc.text(`Time: ${new Date(createdAt).toLocaleString()}`);

    doc.moveDown();
    doc.fontSize(12).text('Items:', { underline: true });
    doc.moveDown(0.5);

    items.forEach((it) => {
      doc.text(`${it.name} (${it.variant})  x${it.quantity}  @ ${formatMoney(it.unitPrice)}  = ${formatMoney(it.lineTotal)}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: ${formatMoney(subTotal)}`);
    doc.text(`GST (${Math.round(gstRate * 100)}%): ${formatMoney(gstAmount)}`);
    doc.fontSize(14).text(`Grand Total: ${formatMoney(grandTotal)}`, { underline: true });

    doc.moveDown(2);
    doc.fontSize(12).text('Thank you for dining with DesiDera!', { align: 'center' });

    doc.end();
  });

  return { fileName, filePath };
}

module.exports = { generateBillPdf };
