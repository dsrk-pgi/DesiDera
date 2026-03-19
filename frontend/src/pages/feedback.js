import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { submitFeedback } from '@/lib/api';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent!' };

function StarButton({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition active:scale-90 ${
        active
          ? 'bg-brand-600 text-white shadow-brand animate-star-pop'
          : 'border border-slate-200 bg-white text-slate-300 hover:border-brand-300 hover:text-brand-400'
      }`}
    >
      ★
    </button>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center animate-fade-up">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 animate-bounce-in">
        <svg
          className="h-12 w-12 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="animate-draw-check"
            style={{ strokeDasharray: 60, strokeDashoffset: 60 }}
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal-900">Thank you!</h2>
        <p className="mt-2 text-sm text-slate-500">Your feedback helps DesiDera serve you better.</p>
      </div>
      <Link
        href="/"
        className="mt-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-500"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await submitFeedback({ name, rating, comments });
      setDone(true);

      const msg = 'Thank you for dining with DesiDera!';
      const link = `https://wa.me/917318582007?text=${encodeURIComponent(msg)}`;
      window.open(link, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout
      title="Feedback"
      rightLinks={
        <Link href="/" className="text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600">
          ← Home
        </Link>
      }
    >
      {done ? (
        <SuccessState />
      ) : (
        <div className="mx-auto max-w-lg">
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 p-6 text-white shadow-brand">
            <h2 className="font-display text-2xl font-bold">How was your experience?</h2>
            <p className="mt-1 text-sm text-brand-100">We&apos;d love to hear what you think about DesiDera.</p>
          </div>

          <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Your Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <div className="mt-5">
              <span className="text-sm font-bold text-slate-900">Rating</span>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarButton key={n} value={n} active={n <= rating} onClick={setRating} />
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-extrabold text-brand-700 animate-fade-up">
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
            </div>

            <label className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Comments</span>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Tell us what you loved (or what we can improve)…"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-200"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
}
