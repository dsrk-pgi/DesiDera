import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function KitchenDisplay() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await res.json();
      const pendingOrders = (data.orders || []).filter(order => order.status === 'pending');
      
      const sortedOrders = pendingOrders.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      setOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
    }
  }

  async function markAsServed(orderId) {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'served' })
      });

      if (!res.ok) throw new Error('Failed to update');

      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  }

  function getTimeElapsed(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${diffHours}h ${remainingMins}m ago`;
  }

  function getUrgencyColor(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMins = Math.floor((now - created) / 60000);
    
    if (diffMins < 5) return 'border-emerald-300 bg-emerald-50';
    if (diffMins < 10) return 'border-amber-300 bg-amber-50';
    return 'border-red-300 bg-red-50';
  }

  function getUrgencyBadge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMins = Math.floor((now - created) / 60000);
    
    if (diffMins < 5) return { text: 'Fresh', color: 'bg-emerald-500' };
    if (diffMins < 10) return { text: 'Cooking', color: 'bg-amber-500' };
    return { text: 'URGENT!', color: 'bg-red-500 animate-pulse' };
  }

  if (loading) {
    return (
      <Layout title="Kitchen Display - DesiDera">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Loading kitchen orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Kitchen Display - DesiDera">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-charcoal-900">🔥 Kitchen Display</h1>
            <p className="mt-1 text-sm text-slate-500">Pending orders • Oldest first</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-2xl">🎉</p>
            <p className="mt-4 text-lg font-semibold text-slate-600">All caught up!</p>
            <p className="mt-1 text-sm text-slate-400">No pending orders in the kitchen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const urgency = getUrgencyBadge(order.createdAt);
              
              return (
                <div
                  key={order._id}
                  className={`rounded-3xl border-2 p-6 shadow-lg transition ${getUrgencyColor(order.createdAt)}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-charcoal-900">
                        Table #{order.tableNumber}
                      </h2>
                      <p className="text-sm font-semibold text-slate-600">
                        {getTimeElapsed(order.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${urgency.color}`}>
                      {urgency.text}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-charcoal-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.variant === 'half' ? 'Half Plate' : 'Full Plate'}
                            </p>
                          </div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3">
                    <p className="text-sm font-semibold text-slate-600">Order Total</p>
                    <p className="text-xl font-extrabold text-brand-700">
                      ₹{order.grandTotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => markAsServed(order._id)}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-base font-extrabold text-white shadow-lg transition hover:from-blue-500 hover:to-cyan-500 active:scale-95"
                  >
                    ✓ Mark as Served
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-sm font-semibold text-blue-800">
            Auto-refreshes every 10 seconds • {orders.length} pending {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </div>
    </Layout>
  );
}
