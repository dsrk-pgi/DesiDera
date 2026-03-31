export default function RunningBill({ sessionOrders, tableNumber }) {
  if (!sessionOrders || sessionOrders.length === 0) {
    return null;
  }

  const sessionTotal = sessionOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
  const allItems = sessionOrders.flatMap(order => order.items || []);

  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-blue-900">Running Bill</h3>
          <p className="text-xs text-blue-600">Table #{tableNumber} • {sessionOrders.length} order{sessionOrders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-600">Session Total</p>
          <p className="text-2xl font-extrabold text-blue-900">₹{sessionTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {sessionOrders.map((order, idx) => (
          <div key={order.orderId || idx} className="rounded-2xl border border-blue-100 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-extrabold text-white">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-700">Order #{order.orderId?.slice(-6) || 'N/A'}</p>
                  <p className="text-[10px] text-slate-400">
                    {order.timestamp ? new Date(order.timestamp).toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm font-extrabold text-blue-700">₹{(order.grandTotal || 0).toFixed(2)}</p>
            </div>

            <div className="space-y-1">
              {order.items?.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    {item.name} ({item.variant === 'half' ? 'Half' : 'Full'}) x{item.quantity}
                  </span>
                  <span className="font-semibold text-slate-700">₹{(item.lineTotal || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-100 p-3">
        <p className="text-center text-xs font-semibold text-blue-800">
          💡 You can continue ordering. Click &quot;Request Final Bill&quot; when you&apos;re done.
        </p>
      </div>
    </div>
  );
}
