const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function apiFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options && options.headers ? options.headers : {})
    },
    cache: 'no-store'
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && data.error ? data.error : 'Request failed';
    throw new Error(message);
  }
  return data;
}

export async function getMenu() {
  return apiFetch('/api/menu');
}

export async function getCart(tableNumber) {
  return apiFetch(`/api/cart/${tableNumber}`);
}

export async function addToCart(tableNumber, payload) {
  return apiFetch(`/api/cart/${tableNumber}/items`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCartItem(tableNumber, payload) {
  return apiFetch(`/api/cart/${tableNumber}/items`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function clearCart(tableNumber) {
  return apiFetch(`/api/cart/${tableNumber}`, { method: 'DELETE' });
}

export async function placeOrder(tableNumber) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ tableNumber })
  });
}

export async function placeOrderWithItems(tableNumber, items) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ tableNumber, items })
  });
}

export async function getOrderHistory(tableNumber) {
  return apiFetch(`/api/orders/table/${tableNumber}`);
}

export async function submitFeedback(payload) {
  return apiFetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
