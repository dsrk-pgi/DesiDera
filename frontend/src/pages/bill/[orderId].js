import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export default function BillPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    
    const storedBill = localStorage.getItem(`bill_${orderId}`);
    if (storedBill) {
      const data = JSON.parse(storedBill);
      setBillData(data);
      generateUpiQR(data.sessionTotal);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  async function generateUpiQR(amount) {
    try {
      const upiId = '7318582007@paytm';
      const name = 'DesiDera';
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=INR`;
      
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const billElement = document.getElementById('bill-content');
      const canvas = await html2canvas(billElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DesiDera_Bill_${orderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">Bill not found</p>
          <Link href="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedTime = currentDate.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div id="bill-content" className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-2xl md:p-12">
          {/* Header */}
          <div className="mb-8 border-b-2 border-slate-200 pb-6 text-center">
            <h1 className="font-display text-4xl font-bold text-charcoal-900">DesiDera</h1>
            <p className="mt-2 text-sm text-slate-600">Authentic Indian Cuisine</p>
            <p className="mt-1 text-xs text-slate-500">📍 Location • 📞 +91 731 858 2007</p>
          </div>

          {/* Bill Info */}
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Table Number</p>
              <p className="text-2xl font-bold text-charcoal-900">#{billData.tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Date & Time</p>
              <p className="text-sm font-bold text-slate-700">{formattedDate}</p>
              <p className="text-sm text-slate-600">{formattedTime}</p>
            </div>
          </div>

          {/* Order ID */}
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold text-slate-500">Bill ID</p>
            <p className="font-mono text-sm font-bold text-slate-700">{orderId}</p>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="mb-3 grid grid-cols-12 gap-2 border-b-2 border-slate-300 pb-2 text-xs font-bold text-slate-700">
              <div className="col-span-5">ITEM</div>
              <div className="col-span-2 text-center">PRICE</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-3 text-right">SUBTOTAL</div>
            </div>

            <div className="space-y-2">
              {billData.sessionOrders?.map((order, orderIdx) => (
                <div key={orderIdx} className="space-y-2">
                  {order.items?.map((item, itemIdx) => (
                    <div key={itemIdx} className="grid grid-cols-12 gap-2 border-b border-slate-100 py-2 text-sm">
                      <div className="col-span-5 text-slate-800">
                        {item.name}
                        <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">
                          {item.variant === 'half' ? 'Half' : 'Full'}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-slate-600">
                        ₹{item.unitPrice?.toFixed(0)}
                      </div>
                      <div className="col-span-2 text-center font-semibold text-slate-700">
                        {item.quantity}
                      </div>
                      <div className="col-span-3 text-right font-semibold text-slate-800">
                        ₹{(item.lineTotal || 0).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 space-y-2 border-t-2 border-slate-300 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-800">
                ₹{billData.sessionOrders?.reduce((sum, order) => sum + (order.subTotal || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">GST (5%)</span>
              <span className="font-semibold text-slate-800">
                ₹{billData.sessionOrders?.reduce((sum, order) => sum + (order.gstAmount || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-100 p-4 text-lg">
              <span className="font-bold text-emerald-900">GRAND TOTAL</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                ₹{billData.sessionTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold text-slate-500">Payment Mode</p>
            <p className="text-sm font-bold text-slate-700">Cash / Online</p>
          </div>

          {/* UPI QR Code */}
          {qrCodeUrl && (
            <div className="mb-6 rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <h3 className="mb-4 text-center text-lg font-bold text-blue-900">
                💳 Pay via UPI
              </h3>
              <div className="flex flex-col items-center">
                <div className="rounded-2xl border-4 border-white bg-white p-3 shadow-lg">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="h-48 w-48" />
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-blue-800">
                  Scan with any UPI app to pay ₹{billData.sessionTotal?.toFixed(2)}
                </p>
                <p className="mt-2 text-center text-xs text-slate-600">
                  Google Pay • PhonePe • Paytm • BHIM
                </p>
              </div>
            </div>
          )}

          {/* Thank You Message */}
          <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
            <h3 className="text-xl font-bold text-amber-900">Thank you for dining with us! 🙏</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              We hope you enjoyed every bite of your DesiDera experience!
            </p>
          </div>

          {/* Feedback Section */}
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 text-center">
            <h3 className="text-lg font-bold text-blue-900">How was your meal? 🌟</h3>
            <p className="mt-2 text-sm text-slate-700">
              We are a growing kitchen and your honest feedback helps us serve you better next time.
            </p>
            <Link
              href="/feedback"
              className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-base font-extrabold text-white shadow-lg transition hover:from-blue-500 hover:to-cyan-500"
            >
              👉 Share Your Feedback
            </Link>
            <p className="mt-3 text-xs text-blue-700">It only takes 30 seconds!</p>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t-2 border-slate-200 pt-6 text-center">
            <p className="text-sm font-semibold text-slate-700">See you again soon! 💚</p>
            <p className="mt-2 text-xs text-slate-500">Visit us at www.desidera.com</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1 rounded-2xl bg-charcoal-800 px-6 py-4 text-center text-base font-extrabold text-white shadow-lg transition hover:bg-charcoal-700 disabled:opacity-50"
          >
            {downloading ? 'Generating PDF...' : '📄 Download Bill as PDF'}
          </button>
          <Link
            href={`/table/${billData.tableNumber}`}
            className="flex-1 rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 text-center text-base font-extrabold text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            🍽️ Start New Session
          </Link>
        </div>
      </div>
    </div>
  );
}
