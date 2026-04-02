import { useState } from 'react';

export default function ServiceBell({ tableNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  async function handleServiceRequest(requestType) {
    setSending(true);
    setMessage('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE}/api/service/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, requestType })
      });

      if (!res.ok) throw new Error('Failed to send request');

      const data = await res.json();
      setMessage(data.message || 'Request sent successfully!');
      setIsOpen(false);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const serviceOptions = [
    { 
      type: 'call_waiter', 
      label: 'Call Waiter', 
      icon: '👋',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      type: 'request_water', 
      label: 'Request Water', 
      icon: '💧',
      color: 'from-cyan-500 to-cyan-600'
    },
    { 
      type: 'request_cleaning', 
      label: 'Request Cleaning', 
      icon: '🧹',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <>
      {message && (
        <div className="fixed top-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-fade-up">
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center shadow-lg">
            <p className="text-sm font-bold text-emerald-800">{message}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-3xl shadow-2xl transition hover:scale-110 active:scale-95 lg:bottom-5"
        aria-label="Service Bell"
      >
        🔔
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl lg:rounded-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-charcoal-900">Service Request</h3>
                <p className="text-sm text-slate-500">Table #{tableNumber}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {serviceOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleServiceRequest(option.type)}
                  disabled={sending}
                  className={`flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r ${option.color} p-4 text-left text-white shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:opacity-50`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold">{option.label}</p>
                    <p className="text-xs opacity-90">Staff will be notified immediately</p>
                  </div>
                  <span className="text-xl">→</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Your request will appear on the owner dashboard
            </p>
          </div>
        </div>
      )}
    </>
  );
}
