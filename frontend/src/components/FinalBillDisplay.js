import Link from 'next/link';

export default function FinalBillDisplay({ generatedBill, tableNumber }) {
  if (!generatedBill || !generatedBill.isFinalBill) {
    return null;
  }

  return (
    <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-xl animate-fade-up">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-emerald-900">Thank you for dining with us! 🙏</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Your meal is complete, and your final bill is ready below. We hope you enjoyed every bite of your <span className="font-bold text-emerald-700">DesiDera</span> experience!
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-emerald-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between border-b border-emerald-100 pb-3">
          <p className="text-sm font-semibold text-slate-700">Final Bill</p>
          <p className="text-xs text-slate-500">Table #{tableNumber}</p>
        </div>

        {generatedBill.sessionOrders && generatedBill.sessionOrders.length > 0 && (
          <div className="mb-4 space-y-2">
            {generatedBill.sessionOrders.map((order, idx) => (
              <div key={order.orderId || idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600">Order #{idx + 1}</p>
                  <p className="text-sm font-bold text-emerald-700">₹{(order.grandTotal || 0).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  {order.items?.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center justify-between text-xs text-slate-600">
                      <span>{item.name} ({item.variant === 'half' ? 'Half' : 'Full'}) x{item.quantity}</span>
                      <span className="font-semibold">₹{(item.lineTotal || 0).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-emerald-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-emerald-900">Total Amount</p>
            <p className="text-3xl font-extrabold text-emerald-700">₹{generatedBill.total || '0.00'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        {generatedBill.billUrl && (
          <a
            href={generatedBill.billUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-charcoal-800 px-6 py-3.5 text-center text-sm font-extrabold text-white shadow-lg transition hover:bg-charcoal-700"
          >
            📄 Download Final Bill PDF
          </a>
        )}

        {generatedBill.whatsappBillLink && (
          <a
            href={generatedBill.whatsappBillLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border-2 border-emerald-400 bg-white px-6 py-3.5 text-center text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-50"
          >
            📲 Share via WhatsApp
          </a>
        )}
      </div>

      <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
        <h3 className="text-center text-lg font-bold text-amber-900">How was your meal? 🌟</h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
          We are a growing kitchen and your honest feedback helps us serve you better next time. It only takes 30 seconds:
        </p>
        
        <Link
          href="/feedback"
          className="mt-4 block rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-center text-base font-extrabold text-white shadow-xl transition hover:from-amber-400 hover:to-orange-400 active:scale-[0.98]"
        >
          👉 Share Your Feedback
        </Link>
        
        <p className="mt-3 text-center text-xs text-amber-700">
          Your opinion matters to us!
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-100 p-4">
        <p className="text-center text-sm font-semibold text-emerald-900">See you again soon! 💚</p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 block w-full rounded-2xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
      >
        🍽️ Start New Session
      </button>
    </div>
  );
}
