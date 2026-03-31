import Link from 'next/link';

export default function FinalBillThankYou({ generatedBill, tableNumber }) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 shadow-lg">
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

        <h2 className="font-display text-3xl font-bold text-emerald-900">Thank you for dining with us! 🙏</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          Your meal is complete, and your final bill is ready below. We hope you enjoyed every bite of your <span className="font-bold text-emerald-700">DesiDera</span> experience!
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-300 bg-white p-6">
          <p className="text-sm font-semibold text-slate-700">Final Bill Amount</p>
          <p className="mt-1 text-4xl font-extrabold text-emerald-600">
            ₹{generatedBill?.total || '0.00'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Table #{tableNumber}</p>
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
        </div>

        <div className="mt-8 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
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

        <button
          onClick={() => window.location.reload()}
          className="mt-6 block w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
        >
          🍽️ Start New Session
        </button>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-100 p-4">
          <p className="text-center text-sm font-semibold text-emerald-900">See you again soon! 💚</p>
        </div>
      </div>
    </div>
  );
}
