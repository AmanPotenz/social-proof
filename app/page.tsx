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
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

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

  // Filter payments based on selected filters
  const filteredPayments = payments.filter((payment) => {
    // Plan filter
    if (planFilter !== 'all') {
      if (planFilter === 'pro' && payment.plan !== 'Pro') return false;
      if (planFilter === 'pro-plus' && payment.plan !== 'Pro Plus') return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const paymentAge = now - payment.timestamp;

      if (dateFilter === '24h' && paymentAge > dayInMs) return false;
      if (dateFilter === '7d' && paymentAge > 7 * dayInMs) return false;
      if (dateFilter === '30d' && paymentAge > 30 * dayInMs) return false;
      if (dateFilter === '3m' && paymentAge > 90 * dayInMs) return false;
    }

    return true;
  });

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
            <div className="text-4xl font-bold text-white">{filteredPayments.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-white">
              ${filteredPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-gray-400 text-sm mb-2">Latest Purchase</div>
            <div className="text-2xl font-bold text-white">
              {filteredPayments.length > 0 ? getRelativeTime(filteredPayments[0].timestamp) : 'No purchases yet'}
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
              Pro Plan - $9.00
            </a>
            <a
              href="https://buy.stripe.com/test_fZu6oJcH3eH4c6s2pL4AU01"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Pro Plus Plan - $29.00
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Filter */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Filter by Plan
              </label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">All Plans</option>
                <option value="pro">Pro</option>
                <option value="pro-plus">Pro Plus</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Filter by Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="3m">Last 3 Months</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(planFilter !== 'all' || dateFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {planFilter !== 'all' && (
                <span className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm">
                  {planFilter === 'pro' ? 'Pro' : 'Pro Plus'}
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="px-3 py-1 bg-blue-500/30 text-blue-300 rounded-full text-sm">
                  {dateFilter === '24h' && 'Last 24 Hours'}
                  {dateFilter === '7d' && 'Last 7 Days'}
                  {dateFilter === '30d' && 'Last 30 Days'}
                  {dateFilter === '3m' && 'Last 3 Months'}
                </span>
              )}
              <button
                onClick={() => {
                  setPlanFilter('all');
                  setDateFilter('all');
                }}
                className="ml-2 text-gray-400 hover:text-white text-sm underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Payment Blocks */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-2xl text-gray-400">
              {payments.length === 0
                ? 'No purchases yet. Make a test purchase to see it appear here!'
                : 'No purchases match the selected filters. Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment, index) => (
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
