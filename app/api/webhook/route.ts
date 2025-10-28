import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { paymentsStore } from '@/lib/payments-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      // For development/testing without webhook secret
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
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
      email: session.customer_details?.email,
    };

    // Add to store
    paymentsStore.addPayment(payment);

    console.log('Payment added:', payment);
  }

  return NextResponse.json({ received: true });
}
