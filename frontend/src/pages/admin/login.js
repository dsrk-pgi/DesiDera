import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Failed to login. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Layout title="Admin Login - DesiDera">
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <h1 className="font-display text-3xl font-bold text-charcoal-900">Admin Login</h1>
              <p className="mt-2 text-sm text-slate-500">DesiDera Owner Dashboard</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-200"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-center text-xs text-slate-600">
                🔒 This area is restricted to authorized personnel only
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
