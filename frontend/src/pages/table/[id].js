import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { jsPDF } from 'jspdf';
import Link from 'next/link';
import Layout from '@/components/Layout';
import MenuItemCard from '@/components/MenuItemCard';
import CartPanel from '@/components/CartPanel';
import Toast from '@/components/Toast';
import ShimmerCard from '@/components/ShimmerCard';
import RunningBill from '@/components/RunningBill';
import FinalBillDisplay from '@/components/FinalBillDisplay';
import { getMenu, getOrderHistory, placeOrderWithItems } from '@/lib/api';

function buildWhatsAppLink({ tableNumber, cartLines }) {
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const lines = cartLines.map((l) => {
    const unit = l.variant === 'half' ? l.halfPrice : l.fullPrice;
    const lineTotal = unit * l.quantity;
    const variantLabel = l.variant === 'half' ? 'Half' : 'Full';
    return `- ${l.name} (${variantLabel}) x${l.quantity} = ₹${lineTotal}`;
  });

  const msg = [
    'DesiDera Order',
    `Table No: ${tableNumber}`,
    'Items:',
    ...lines,
    '',
    `Time: ${time}`
  ].join('\n');

  const encoded = encodeURIComponent(msg);
  return `https://wa.me/917318582007?text=${encoded}`;
}

export default function TablePage() {
  const router = useRouter();
  const [tableId, setTableId] = useState('');
  const tableNumber = Number(tableId);

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState({});
  const [selectedQty, setSelectedQty] = useState({});

  const [orderResult, setOrderResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sessionOrders, setSessionOrders] = useState([]);
  const [showFinalBill, setShowFinalBill] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(menu.map((it) => it.category).filter(Boolean))];
    return ['All', ...cats];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'All') return menu;
    return menu.filter((it) => it.category === activeCategory);
  }, [menu, activeCategory]);

  const storageKey = useMemo(() => {
    if (!tableId) return '';
    return `desidera_cart_table_${tableId}`;
  }, [tableId]);

  const sessionKey = useMemo(() => {
    if (!tableId) return '';
    return `desidera_session_table_${tableId}`;
  }, [tableId]);

  useEffect(() => {
    return () => {
      if (generatedBill && generatedBill.blobUrl) {
        URL.revokeObjectURL(generatedBill.blobUrl);
      }
    };
  }, [generatedBill]);

  const subTotal = useMemo(() => {
    return cart.reduce((sum, it) => {
      const unit = it.variant === 'half' ? it.halfPrice : it.fullPrice;
      return sum + unit * it.quantity;
    }, 0);
  }, [cart]);

  const gst = useMemo(() => Number((subTotal * 0.18).toFixed(2)), [subTotal]);
  const total = useMemo(() => Number((subTotal + gst).toFixed(2)), [subTotal, gst]);

  function persist(nextCart) {
    setCart(nextCart);
    setGeneratedBill(null);
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextCart));
    } catch (e) {
      setError('Failed to persist cart');
    }
  }

  function hydrate() {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setCart([]);
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      setCart([]);
    }

    if (!sessionKey) return;
    try {
      const sessionRaw = window.localStorage.getItem(sessionKey);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (Array.isArray(parsed)) {
          setSessionOrders(parsed);
        }
      }
    } catch (e) {
      setSessionOrders([]);
    }
  }

  function persistSession(orders) {
    setSessionOrders(orders);
    if (!sessionKey) return;
    try {
      window.localStorage.setItem(sessionKey, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist session');
    }
  }

  function clearSession() {
    setSessionOrders([]);
    if (!sessionKey) return;
    try {
      window.localStorage.removeItem(sessionKey);
    } catch (e) {
      console.error('Failed to clear session');
    }
  }

  async function refreshMenu() {
    const { items } = await getMenu();
    setMenu(items);
  }

  async function refreshHistory() {
    const { orders } = await getOrderHistory(tableNumber);
    setOrderHistory(orders || []);
  }

  useEffect(() => {
    if (!router.isReady) return;
    const nextId = String(router.query.id || '');
    setTableId(nextId);
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    if (!storageKey) return;
    hydrate();
  }, [storageKey]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        if (!Number.isFinite(tableNumber)) {
          throw new Error('Invalid table number');
        }
        await refreshMenu();
        await refreshHistory();
        if (active) setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Failed to load');
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tableNumber]);

  async function onAdd(item) {
    const variant = selectedVariant[item._id] || 'full';
    const qty = selectedQty[item._id] || 1;

    const next = [...cart];
    const idx = next.findIndex((l) => l.menuItemId === item._id && l.variant === variant);
    if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
    } else {
      next.push({
        menuItemId: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
        variant,
        quantity: qty,
        halfPrice: item.halfPrice ?? item.priceHalf,
        fullPrice: item.fullPrice ?? item.priceFull,
        priceHalf: item.priceHalf ?? item.halfPrice,
        priceFull: item.priceFull ?? item.fullPrice,
        category: item.category || ''
      });
    }

    persist(next);
  }

  function onDec(line) {
    const next = cart
      .map((l) => {
        if (l.menuItemId === line.menuItemId && l.variant === line.variant) {
          return { ...l, quantity: Math.max(0, l.quantity - 1) };
        }
        return l;
      })
      .filter((l) => l.quantity > 0);

    persist(next);
  }

  function onInc(line) {
    const next = cart.map((l) => {
      if (l.menuItemId === line.menuItemId && l.variant === line.variant) {
        return { ...l, quantity: l.quantity + 1 };
      }
      return l;
    });

    persist(next);
  }

  function onRemove(line) {
    const next = cart.filter((l) => !(l.menuItemId === line.menuItemId && l.variant === line.variant));
    persist(next);
  }

  function onVariantChange(line, nextVariant) {
    if (!['half', 'full'].includes(nextVariant)) return;

    const next = [...cart];
    const idx = next.findIndex((l) => l.menuItemId === line.menuItemId && l.variant === line.variant);
    if (idx === -1) return;

    const existingIdx = next.findIndex((l) => l.menuItemId === line.menuItemId && l.variant === nextVariant);
    const moved = { ...next[idx], variant: nextVariant };

    if (existingIdx >= 0) {
      next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + moved.quantity };
      next.splice(idx, 1);
    } else {
      next[idx] = moved;
    }

    persist(next);
  }

  async function onPlaceOrder() {
    setError('');
    setPlacing(true);
    setOrderResult(null);
    try {
      const itemsPayload = cart.map((l) => ({
        menuItemId: l.menuItemId,
        variant: l.variant,
        quantity: l.quantity
      }));

      const res = await placeOrderWithItems(tableNumber, itemsPayload);
      setOrderResult({ ...res });
      
      const newSessionOrder = {
        orderId: res.orderId,
        items: cart.map(l => ({
          ...l,
          unitPrice: l.variant === 'half' ? l.halfPrice : l.fullPrice,
          lineTotal: (l.variant === 'half' ? l.halfPrice : l.fullPrice) * l.quantity
        })),
        subTotal: res.subTotal || subTotal,
        gstAmount: res.gstAmount || gst,
        grandTotal: res.grandTotal || total,
        timestamp: new Date().toISOString()
      };
      
      persistSession([...sessionOrders, newSessionOrder]);
      persist([]);

      await refreshHistory();
    } catch (e) {
      setError(e.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  function formatTime(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return String(iso || '');
    }
  }

  async function onGenerateBill() {
    if (!Number.isFinite(tableNumber)) {
      setError('Invalid table number');
      return;
    }

    if (!cart || cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setError('');
    setPlacing(true);

    try {
      const itemsPayload = cart.map((l) => ({
        menuItemId: l.menuItemId,
        variant: l.variant,
        quantity: l.quantity
      }));

      const res = await placeOrderWithItems(tableNumber, itemsPayload);
      
      const msg = `Your bill from DesiDera is ready. Total: ₹${Number(res.grandTotal || total).toFixed(2)}`;
      const whatsappBillLink = `https://wa.me/917318582007?text=${encodeURIComponent(msg)}`;

      setGeneratedBill({ 
        billUrl: res.billUrl,
        fileName: `DesiDera_Table_${tableNumber}_Bill.pdf`,
        whatsappBillLink, 
        total: Number(res.grandTotal || total).toFixed(2) 
      });

      await refreshHistory();
    } catch (e) {
      setError(e.message || 'Failed to generate bill');
    } finally {
      setPlacing(false);
    }
  }

  async function onRequestFinalBill() {
    if (!Number.isFinite(tableNumber)) {
      setError('Invalid table number');
      return;
    }

    if (sessionOrders.length === 0) {
      setError('No orders in this session');
      return;
    }

    setError('');
    setPlacing(true);

    try {
      const sessionTotal = sessionOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
      const allItems = sessionOrders.flatMap(order => order.items || []);
      
      const consolidatedItems = allItems.reduce((acc, item) => {
        const key = `${item.menuItemId}_${item.variant}`;
        if (acc[key]) {
          acc[key].quantity += item.quantity;
          acc[key].lineTotal += item.lineTotal || 0;
        } else {
          acc[key] = { ...item };
        }
        return acc;
      }, {});

      const itemsPayload = Object.values(consolidatedItems).map(item => ({
        menuItemId: item.menuItemId,
        variant: item.variant,
        quantity: item.quantity
      }));

      const res = await placeOrderWithItems(tableNumber, itemsPayload);

      const orderSummary = sessionOrders.map((order, idx) => 
        `Order ${idx + 1}: ₹${(order.grandTotal || 0).toFixed(2)}`
      ).join('\n');

      const msg = [
        'DesiDera - Final Bill Request',
        `Table No: ${tableNumber}`,
        '',
        'Session Summary:',
        orderSummary,
        '',
        `Total Amount: ₹${sessionTotal.toFixed(2)}`,
        '',
        'Thank you for dining with us!'
      ].join('\n');

      const whatsappLink = `https://wa.me/917318582007?text=${encodeURIComponent(msg)}`;
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');

      setGeneratedBill({ 
        billUrl: res.billUrl,
        fileName: `DesiDera_Table_${tableNumber}_FinalBill.pdf`,
        whatsappBillLink: whatsappLink, 
        total: sessionTotal.toFixed(2),
        isFinalBill: true,
        sessionOrders: sessionOrders,
        sessionTotal: sessionTotal
      });

      clearSession();
      persist([]);

      await refreshHistory();
    } catch (e) {
      setError(e.message || 'Failed to generate final bill');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Layout title={`DesiDera — Table ${Number.isFinite(tableNumber) ? tableNumber : ''}`}>
      <Toast message={error} type="error" onDismiss={() => setError('')} />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="h-7 w-48 rounded-xl shimmer-bg" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
              <div className="h-5 w-24 rounded-xl shimmer-bg" />
              <div className="h-32 rounded-2xl shimmer-bg" />
              <div className="h-12 rounded-2xl shimmer-bg" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900">Today&apos;s Menu</h2>
                <p className="mt-0.5 text-sm text-slate-500">Freshly prepared, served hot.</p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                {menu.length} items
              </span>
            </div>

            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      activeCategory === cat
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMenu.map((it, index) => {
                const variant = selectedVariant[it._id] || 'full';
                const qty = selectedQty[it._id] || 1;

                return (
                  <div
                    key={it._id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <MenuItemCard
                      item={it}
                      variant={variant}
                      qty={qty}
                      onVariantChange={(v) => setSelectedVariant((s) => ({ ...s, [it._id]: v }))}
                      onQtyChange={(q) => setSelectedQty((s) => ({ ...s, [it._id]: q }))}
                      onAdd={() => onAdd(it)}
                    />
                  </div>
                );
              })}
            </div>

            {sessionOrders.length > 0 && !generatedBill?.isFinalBill && (
              <RunningBill 
                sessionOrders={sessionOrders} 
                tableNumber={tableNumber}
                onRequestFinalBill={onRequestFinalBill}
                placing={placing}
              />
            )}

            {generatedBill?.isFinalBill && (
              <FinalBillDisplay 
                generatedBill={generatedBill}
                tableNumber={tableNumber}
              />
            )}
          </section>

          <div className="hidden lg:block">
            <CartPanel
              cart={cart}
              subTotal={subTotal}
              gst={gst}
              total={total}
              placing={placing}
              onDec={onDec}
              onInc={onInc}
              onRemove={onRemove}
              onVariantChange={onVariantChange}
              onGenerateBill={onGenerateBill}
              generatedBill={generatedBill}
              onPlaceOrder={onPlaceOrder}
              orderResult={orderResult}
              sessionOrders={sessionOrders}
              onRequestFinalBill={onRequestFinalBill}
              mode="sidebar"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl bg-brand-600 px-5 py-4 text-left text-white shadow-brand transition hover:bg-brand-500 active:scale-[0.98] lg:hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold">View Cart</p>
            <p className="mt-0.5 text-xs text-brand-200">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
          </div>
          <span className="text-base font-extrabold">₹{total.toFixed(2)}</span>
        </div>
      </button>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${cartOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!cartOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setCartOpen(false)}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-auto rounded-t-4xl bg-white p-5 transition-transform duration-300 ${cartOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-charcoal-900">Your Cart</h2>
            <button
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              ✕
            </button>
          </div>

          <CartPanel
            cart={cart}
            subTotal={subTotal}
            gst={gst}
            total={total}
            placing={placing}
            onDec={onDec}
            onInc={onInc}
            onRemove={onRemove}
            onVariantChange={onVariantChange}
            onGenerateBill={onGenerateBill}
            generatedBill={generatedBill}
            onPlaceOrder={async () => {
              await onPlaceOrder();
              setCartOpen(false);
            }}
            orderResult={orderResult}
            sessionOrders={sessionOrders}
            onRequestFinalBill={async () => {
              await onRequestFinalBill();
              setCartOpen(false);
            }}
            mode="drawer"
          />
        </div>
      </div>
    </Layout>
  );
}
