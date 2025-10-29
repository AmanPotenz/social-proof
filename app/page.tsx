'use client';

import { useEffect, useState } from 'react';

interface Payment {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  timestamp: number;
  email?: string;
  plan?: string;
}

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Add a test payment
  const addTestPayment = async () => {
    try {
      await fetch('/api/test-payment', { method: 'POST' });
      await fetchPayments();
    } catch (error) {
      console.error('Error adding test payment:', error);
    }
  };

  // Handle custom checkout (redirects back to main site)
  const handleCustomCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout', { method: 'POST' });
      const data = await response.json();

      if (data.error) {
        console.error('Checkout error:', data.error);
        alert('Error creating checkout. Please try the direct link below.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout. Please try the direct link below.');
    }
  };

  // Initial fetch and polling every 5 seconds
  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Social Proof Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Real-time successful payments from our customers
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
            <span className="text-green-400 font-semibold">
              🟢 Live - Updates every 5 seconds
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Purchases</div>
            <div className="text-4xl font-bold text-white">{payments.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-white">
              ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Latest Purchase</div>
            <div className="text-2xl font-bold text-white">
              {payments.length > 0 ? getRelativeTime(payments[0].timestamp) : 'No purchases yet'}
            </div>
          </div>
        </div>

        {/* Test Purchase Buttons */}
        <div className="text-center mb-8 space-y-4">
          <div>
            <button
              onClick={handleCustomCheckout}
              className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              Make Test Purchase (Auto-Redirect)
            </button>
          </div>
          <div className="text-gray-400 text-sm">or</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <a
              href="https://buy.stripe.com/test_14AeVf22pgPcgmI7K54AU00"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              Plan 1 - Direct Stripe Link
            </a>
            <a
              href="https://buy.stripe.com/test_fZu6oJcH3eH4c6s2pL4AU01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Plan 2 - Direct Stripe Link
            </a>
          </div>
        </div>

        {/* Payment Blocks */}
        {payments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-2xl text-gray-400">
              No purchases yet. Make a test purchase to see it appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div
                key={payment.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all transform hover:scale-[1.02] animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {payment.customerName.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {payment.customerName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {payment.email || 'Customer'}
                        {payment.plan && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs">
                            {payment.plan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {payment.currency} ${payment.amount.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {getRelativeTime(payment.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
