import { NextResponse } from 'next/server';
import { paymentsStore } from '@/lib/payments-store';

export async function GET() {
  const payments = paymentsStore.getRecentPayments(20);
  return NextResponse.json({ payments });
}

// Allow CORS if needed
export const dynamic = 'force-dynamic';
