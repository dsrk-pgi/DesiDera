import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout title="DesiDera" subtitle="Authentic Indian Dining Experience">

      {/* Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-4xl shadow-float">
        <div className="relative h-64 w-full sm:h-80 lg:h-96">
          <Image
            src="/rest.jpg"
            alt="DesiDera Restaurant"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 className="font-display text-3xl font-bold text-white drop-shadow sm:text-4xl">
            Welcome to DesiDera
          </h2>
          <p className="mt-2 text-sm font-semibold text-white/80">
            Freshly prepared · Served with love · Authentic flavours
          </p>
          <Link
            href="/table/1"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-500 active:scale-[0.98]"
          >
            View Menu →
          </Link>
        </div>
      </div>

      {/* Table + Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-extrabold tracking-tight text-slate-900">Select Your Table</p>
          <p className="mt-1 text-sm text-slate-500">Tap your table number to open the menu.</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Link
                key={n}
                href={`/table/${n}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                Table {n}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card">
          <p className="text-sm font-extrabold tracking-tight text-brand-900">Premium dining, simplified</p>
          <p className="mt-2 text-sm text-slate-600">
            Browse the menu, add items to your cart, generate a GST bill and place orders instantly via WhatsApp.
          </p>
          <div className="mt-6">
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center rounded-2xl bg-charcoal-800 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:opacity-90"
            >
              Leave Feedback ★
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
