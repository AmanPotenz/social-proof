import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { paymentsStore } from '@/lib/payments-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

// Disable body parsing for this route
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Get raw body as buffer for signature verification
    const buffer = await req.arrayBuffer();
    const body = Buffer.from(buffer);

    console.log('Webhook received:', {
      hasSignature: !!sig,
      hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      bodyLength: body.length,
    });

    // Verify webhook signature
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('Skipping signature verification (no sig or secret)');
      // For development/testing without webhook secret
      event = JSON.parse(body.toString());
    } else {
      console.log('Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Signature verified successfully');
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', {
      error: err.message,
      type: err.type,
      hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    });
    return NextResponse.json(
      { error: 'Webhook signature verification failed', message: err.message },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract payment information
    const payment = {
      id: session.id,
      customerName: session.customer_details?.name || 'Anonymous',
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency?.toUpperCase() || 'USD',
      timestamp: Date.now(),
      email: session.customer_details?.email || undefined,
    };

    // Add to store
    paymentsStore.addPayment(payment);

    console.log('Payment added:', payment);
  }

  return NextResponse.json({ received: true });
}
