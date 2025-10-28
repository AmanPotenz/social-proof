import { NextResponse } from 'next/server';
import { paymentsStore } from '@/lib/payments-store';
import { fetchRecentPayments } from '@/lib/airtable';

export async function GET() {
  // Try to fetch from Airtable first
  const airtablePayments = await fetchRecentPayments(20);

  if (airtablePayments.length > 0) {
    // If we have Airtable data, use it (includes test Stripe payments)
    return NextResponse.json({ payments: airtablePayments });
  }

  // Fallback to in-memory store if Airtable is not available
  const payments = paymentsStore.getRecentPayments(20);
  return NextResponse.json({ payments: payments });
}

// Allow CORS if needed
export const dynamic = 'force-dynamic';
