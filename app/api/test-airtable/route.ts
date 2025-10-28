import { NextResponse } from 'next/server';
import { createPaymentRecord } from '@/lib/airtable';

// Test endpoint to verify Airtable write permissions
export async function POST() {
  const testPayment = {
    id: `cs_test_${Date.now()}`,
    customerName: 'Test Customer',
    amount: 99.99,
    currency: 'USD',
    timestamp: Date.now(),
    email: 'test@example.com',
  };

  console.log('Testing Airtable write with payment:', testPayment);

  try {
    const saved = await createPaymentRecord(testPayment);

    return NextResponse.json({
      success: true,
      message: 'Payment saved to Airtable successfully!',
      payment: testPayment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save payment to Airtable',
        error: error.message || String(error),
        payment: testPayment,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
