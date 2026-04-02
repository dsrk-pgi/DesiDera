import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function MenuManagement() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/admin/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch menu');
      }

      const data = await res.json();
      setMenuItems(data.items || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load menu items');
      setLoading(false);
    }
  }

  async function toggleAvailability(itemId, currentStatus) {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    setUpdating({ ...updating, [itemId]: true });

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/admin/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();
      setMenuItems(menuItems.map(item => 
        item._id === itemId ? data.item : item
      ));
    } catch (err) {
      setError('Failed to update item availability');
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout title="Menu Management - DesiDera">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Loading menu...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Menu Management - DesiDera">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal-900">Menu Management</h1>
            <p className="mt-1 text-sm text-slate-500">Toggle item availability for customers</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold text-charcoal-900">{category}</h2>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                      item.isAvailable
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-charcoal-900">{item.name}</h3>
                        <p className="text-sm text-slate-600">
                          Half: ₹{item.priceHalf} • Full: ₹{item.priceFull}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.isAvailable ? '✓ Available' : '✕ Out of Stock'}
                      </span>
                      
                      <button
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        disabled={updating[item._id]}
                        className={`relative h-8 w-14 rounded-full transition ${
                          item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                        } ${updating[item._id] ? 'opacity-50' : ''}`}
                      >
                        <div
                          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition ${
                            item.isAvailable ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
