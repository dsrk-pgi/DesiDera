import Image from 'next/image';
import { useState } from 'react';

function money(n) {
  return `₹${Number(n).toFixed(0)}`;
}

export default function MenuItemCard({ item, variant, qty, onVariantChange, onQtyChange, onAdd }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-float">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 900px) 50vw, 400px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
        {item.category ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            {item.category}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold tracking-tight text-slate-900">{item.name}</div>
            {item.description ? (
              <div className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</div>
            ) : null}
          </div>
          <div className="shrink-0 rounded-2xl bg-brand-50 px-2.5 py-1.5 text-right">
            <div className="text-[10px] font-semibold text-slate-500">Half {money(item.halfPrice)}</div>
            <div className="text-sm font-extrabold text-brand-700">Full {money(item.fullPrice)}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <select
            value={variant}
            onChange={(e) => onVariantChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          >
            <option value="half">Half — {money(item.halfPrice)}</option>
            <option value="full">Full — {money(item.fullPrice)}</option>
          </select>

          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-slate-600 transition hover:bg-slate-50 rounded-l-xl active:scale-90"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-extrabold text-slate-900">{qty}</span>
            <button
              onClick={() => onQtyChange(qty + 1)}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-slate-600 transition hover:bg-slate-50 rounded-r-xl active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`mt-3 w-full rounded-xl py-2.5 text-sm font-extrabold shadow-sm transition active:scale-[0.98] ${
            added
              ? 'bg-emerald-500 text-white'
              : 'bg-brand-600 text-white hover:bg-brand-500 hover:shadow-brand'
          }`}
        >
          {added ? '✓ Added to Cart' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
