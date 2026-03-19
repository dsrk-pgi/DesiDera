import Link from 'next/link';

function money(n) {
  return `₹${Number(n).toFixed(0)}`;
}

function EmptyCartState() {
  return (
    <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-cream-50 py-10 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-14 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      <div>
        <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
        <p className="mt-1 text-xs text-slate-400">Add items from the menu to get started.</p>
      </div>
    </div>
  );
}

export default function CartPanel({
  cart,
  subTotal,
  gst,
  total,
  placing,
  onDec,
  onInc,
  onRemove,
  onVariantChange,
  onGenerateBill,
  generatedBill,
  onPlaceOrder,
  orderResult,
  mode = 'sidebar'
}) {
  const containerClassName =
    mode === 'drawer'
      ? 'w-full'
      : 'sticky top-20 w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-card';

  return (
    <aside className={containerClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-charcoal-900">Your Cart</h2>
          <p className="mt-0.5 text-xs text-slate-400">Persists until order is placed.</p>
        </div>
        {cart.length > 0 && (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <EmptyCartState />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {cart.map((line) => {
            const unit = line.variant === 'half' ? line.halfPrice : line.fullPrice;
            return (
              <div key={`${line.menuItemId}_${line.variant}`} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{line.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">@ {money(unit)} each</p>
                  </div>
                  <button
                    onClick={() => onRemove(line)}
                    aria-label={`Remove ${line.name}`}
                    className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <select
                    value={line.variant}
                    onChange={(e) => onVariantChange(line, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="half">Half</option>
                    <option value="full">Full</option>
                  </select>

                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => onDec(line)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-700 transition hover:bg-slate-100 active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-extrabold text-slate-900">{line.quantity}</span>
                    <button
                      onClick={() => onInc(line)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-700 transition hover:bg-slate-100 active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900">{money(unit * line.quantity)}</span>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">{money(subTotal)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-sm text-slate-500">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-700">₹{gst.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-base font-bold text-slate-900">Grand Total</span>
              <span className="text-lg font-extrabold text-brand-700">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={placing || cart.length === 0}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-200"
          >
            {placing ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Placing…
              </>
            ) : (
              '📲 Place Order via WhatsApp'
            )}
          </button>

          <button
            onClick={onGenerateBill}
            disabled={cart.length === 0}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed"
          >
            🧾 Generate Bill (PDF)
          </button>

          {generatedBill && generatedBill.blobUrl ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 animate-fade-up">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white">✓</span>
                <p className="text-sm font-bold text-emerald-900">Bill Ready — ₹{Number(generatedBill.total || 0).toFixed(2)}</p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={generatedBill.blobUrl}
                  download={generatedBill.fileName || 'DesiDera_Bill.pdf'}
                  className="rounded-xl bg-charcoal-800 px-4 py-2.5 text-center text-sm font-extrabold text-white transition hover:opacity-90"
                >
                  ↓ Download PDF
                </a>
                <a
                  href={generatedBill.whatsappBillLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-emerald-300 px-4 py-2.5 text-center text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                >
                  📲 Share via WhatsApp
                </a>
              </div>
              <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-brand-800">Hope you enjoyed your meal! 🍽️</p>
                <p className="mt-0.5 text-xs text-slate-500">We&apos;d love to hear from you.</p>
                <Link
                  href="/feedback"
                  className="mt-2.5 inline-block rounded-xl bg-brand-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-500"
                >
                  Leave Feedback ★
                </Link>
              </div>
            </div>
          ) : null}

          {orderResult ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 animate-fade-up">
              <p className="text-sm font-bold text-brand-900">Order placed! 🎉</p>
              <p className="mt-0.5 text-xs text-brand-600">ID: {orderResult.orderId}</p>
              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href={orderResult.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-brand-700 transition hover:text-brand-500"
                >
                  Open WhatsApp →
                </a>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
