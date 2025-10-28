import { NextResponse } from 'next/server';
import { paymentsStore } from '@/lib/payments-store';
import { fetchRecentPayments } from '@/lib/memberstack';

export async function GET() {
  // Try to fetch from Memberstack first
  const memberstackPayments = await fetchRecentPayments(20);

  if (memberstackPayments.length > 0) {
    // If we have Memberstack data, use it
    return NextResponse.json({ payments: memberstackPayments });
  }

  // Fallback to in-memory store if Memberstack is not available
  const payments = paymentsStore.getRecentPayments(20);
  return NextResponse.json({ payments });
}

// Allow CORS if needed
export const dynamic = 'force-dynamic';
