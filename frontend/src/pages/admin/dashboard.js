import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ activeTables: 0, todayRevenue: '0.00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

      const [ordersRes, statsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/admin/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!ordersRes.ok || !statsRes.ok || !historyRes.ok) {
        if (ordersRes.status === 401 || statsRes.status === 401 || historyRes.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();

      setOrders(ordersData.orders || []);
      setStats(statsData);
      setOrderHistory(historyData.orders || []);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
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
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      fetchData();
    } catch (err) {
      setError('Failed to update order status');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchData();
  }

  const groupedOrders = orders.reduce((acc, order) => {
    const table = order.tableNumber;
    if (!acc[table]) {
      acc[table] = [];
    }
    acc[table].push(order);
    return acc;
  }, {});

  const getTableTotal = (tableOrders) => {
    return tableOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
  };

  const hasFinalBill = (tableOrders) => {
    return tableOrders.some(order => 
      order.whatsappMessage && order.whatsappMessage.includes('Final Bill Request')
    );
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard - DesiDera">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            <p className="mt-4 text-sm font-semibold text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard - DesiDera">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal-900">Owner Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Real-time order management</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <p className="text-sm font-semibold text-blue-700">Active Tables</p>
            <p className="mt-2 text-4xl font-extrabold text-blue-900">{stats.activeTables}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold text-emerald-700">Today&apos;s Revenue</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-900">₹{stats.todayRevenue}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-lg font-semibold text-slate-600">No active orders</p>
            <p className="mt-1 text-sm text-slate-400">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedOrders).map(([tableNumber, tableOrders]) => {
              const isFinalBill = hasFinalBill(tableOrders);
              const tableTotal = getTableTotal(tableOrders);
              
              return (
                <div 
                  key={tableNumber} 
                  className={`rounded-3xl border p-5 shadow-card ${
                    isFinalBill 
                      ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-charcoal-900">Table #{tableNumber}</h3>
                        <p className="text-xs text-slate-500">{tableOrders.length} order{tableOrders.length !== 1 ? 's' : ''}</p>
                      </div>
                      {isFinalBill ? (
                        <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                          🧾 Final Bill
                        </span>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          tableOrders[0].status === 'pending' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tableOrders[0].status === 'pending' ? '🔔 Pending' : '✓ Served'}
                        </span>
                      )}
                    </div>
                    {isFinalBill && (
                      <div className="mt-3 rounded-xl border border-purple-200 bg-white p-3">
                        <p className="text-xs font-semibold text-purple-700">Table Total</p>
                        <p className="text-2xl font-extrabold text-purple-900">₹{tableTotal.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                <div className="space-y-3">
                  {tableOrders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-extrabold text-brand-700">₹{order.grandTotal.toFixed(2)}</p>
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">
                              {item.name} ({item.variant === 'half' ? 'H' : 'F'})
                            </span>
                            <span className="font-semibold text-slate-600">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'served')}
                            className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
                          >
                            Mark Served
                          </button>
                        )}
                        {order.status === 'served' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'completed')}
                            className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Today&apos;s Order History</h2>
              <p className="text-xs text-slate-500">All orders placed today with timestamps</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {showHistory ? 'Hide' : 'Show'} ({orderHistory.length})
            </button>
          </div>

          {showHistory && (
            <div className="space-y-3">
              {orderHistory.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No orders today</p>
              ) : (
                orderHistory.map((order) => (
                  <div key={order._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                          Table #{order.tableNumber}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          order.status === 'pending' 
                            ? 'bg-amber-100 text-amber-700'
                            : order.status === 'served'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.status === 'pending' ? '🔔 Pending' : order.status === 'served' ? '✓ Served' : '✅ Completed'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </p>
                        <p className="text-sm font-extrabold text-brand-700">₹{order.grandTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                          <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {item.variant === 'half' ? 'Half' : 'Full'} × {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
