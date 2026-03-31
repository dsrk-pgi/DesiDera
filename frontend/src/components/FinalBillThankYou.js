import Link from 'next/link';

export default function FinalBillThankYou({ generatedBill, tableNumber }) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 animate-bounce-in">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="font-display text-3xl font-bold text-emerald-900">Thank You!</h2>
        <p className="mt-2 text-lg text-emerald-700">Your final bill is ready</p>
        <p className="mt-1 text-sm text-slate-600">Table #{tableNumber}</p>

        <div className="mt-6 rounded-2xl border border-emerald-300 bg-white p-6">
          <p className="text-sm font-semibold text-slate-700">Total Amount</p>
          <p className="mt-1 text-4xl font-extrabold text-emerald-600">
            ₹{generatedBill?.total || '0.00'}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {generatedBill?.billUrl && (
            <a
              href={generatedBill.billUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-charcoal-800 px-6 py-4 text-center text-sm font-extrabold text-white shadow-lg transition hover:bg-charcoal-700"
            >
              📄 Download Final Bill PDF
            </a>
          )}

          {generatedBill?.whatsappBillLink && (
            <a
              href={generatedBill.whatsappBillLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border-2 border-emerald-400 bg-white px-6 py-4 text-center text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-50"
            >
              📲 Share via WhatsApp
            </a>
          )}

          <Link
            href="/feedback"
            className="block rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4 text-center text-sm font-extrabold text-white shadow-lg transition hover:from-brand-500 hover:to-brand-400"
          >
            ⭐ Leave Feedback
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="block w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            🍽️ Start New Session
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">🙏 Thank you for dining with DesiDera!</p>
          <p className="mt-1 text-xs text-amber-700">We hope you enjoyed your meal. See you again soon!</p>
        </div>
      </div>
    </div>
  );
}
