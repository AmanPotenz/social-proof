import { NextResponse } from 'next/server';
import { createPaymentRecord } from '@/lib/memberstack';

export async function GET() {
  // Test creating a payment record
  const testPayment = {
    id: 'test_' + Date.now(),
    customerName: 'Test Customer',
    amount: 10.00,
    currency: 'USD',
    timestamp: Date.now(),
    email: 'test@example.com',
  };

  console.log('Testing Memberstack with:', testPayment);

  const success = await createPaymentRecord(testPayment);

  return NextResponse.json({
    success,
    message: success
      ? 'Payment saved to Memberstack successfully'
      : 'Failed to save to Memberstack',
    testPayment,
    envCheck: {
      hasMemberstackKey: !!process.env.MEMBERSTACK_SECRET_KEY,
      keyPrefix: process.env.MEMBERSTACK_SECRET_KEY?.substring(0, 5),
    },
  });
}
