import Link from 'next/link';

export default function Layout({ title, subtitle, children, rightLinks }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-brand-800 sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            {rightLinks || (
              <>
                <Link href="/" className="transition-colors hover:text-brand-600">
                  Home
                </Link>
                <Link
                  href="/feedback"
                  className="rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-500"
                >
                  Feedback
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      <footer className="mt-16 border-t border-cream-200 py-6 text-center">
        <p className="font-display text-base font-bold text-brand-700">DesiDera</p>
        <p className="mt-1 text-xs font-medium text-slate-400">Authentic Indian Dining Experience</p>
      </footer>
    </div>
  );
}
