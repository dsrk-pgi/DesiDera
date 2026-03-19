import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  const palette =
    type === 'success'
      ? 'bg-emerald-600 text-white'
      : type === 'warning'
      ? 'bg-amber-500 text-white'
      : 'bg-red-600 text-white';

  const icon =
    type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed left-1/2 top-5 z-[200] flex max-w-sm items-center gap-3 rounded-2xl px-5 py-3.5 shadow-float text-sm font-semibold animate-toast-in ${palette}`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">
        {icon}
      </span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-70 transition hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
