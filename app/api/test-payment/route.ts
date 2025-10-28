import { NextResponse } from 'next/server';
import { paymentsStore } from '@/lib/payments-store';

// Test endpoint to add fake payments for testing the UI
export async function POST() {
  const fakeNames = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Williams',
    'David Brown',
    'Emily Davis',
    'Chris Wilson',
    'Lisa Anderson',
  ];

  const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const randomAmount = (Math.random() * 100 + 10).toFixed(2);

  const payment = {
    id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerName: randomName,
    amount: parseFloat(randomAmount),
    currency: 'USD',
    timestamp: Date.now(),
    email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
  };

  paymentsStore.addPayment(payment);

  return NextResponse.json({ success: true, payment });
}

export const dynamic = 'force-dynamic';
