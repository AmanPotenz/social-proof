import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { paymentsStore } from '@/lib/payments-store';
import { createPaymentRecord } from '@/lib/airtable';

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

  console.log('Webhook event type:', event.type);

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('Processing checkout.session.completed:', {
      sessionId: session.id,
      customerName: session.customer_details?.name,
      amount: session.amount_total,
    });

    // Retrieve line items to get the price/product information
    let planName = 'Pro'; // Default to Pro
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 1,
      });

      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price?.id;
        const productDescription = lineItems.data[0].description;
        const amount = lineItems.data[0].amount_total || 0;

        console.log('Line item details:', {
          priceId,
          productDescription,
          amount,
        });

        // Map price IDs to plan names
        const priceIdToPlan: Record<string, string> = {
          'price_1QSf9qP2koqkGI7YRjVyMo7a': 'Pro',
          'price_1QSfA7P2koqkGI7YY5WDY8f1': 'Pro Plus',
          // Add more price IDs as needed
        };

        // Try to determine plan from price ID first
        if (priceId && priceIdToPlan[priceId]) {
          planName = priceIdToPlan[priceId];
        }
        // Fall back to product description
        else if (productDescription) {
          const desc = productDescription.toLowerCase();
          if (desc.includes('plus') || desc.includes('premium')) {
            planName = 'Pro Plus';
          } else {
            planName = 'Pro';
          }
        }
        // Fall back to amount (higher amount = Pro Plus)
        else if (amount >= 1000) { // $10 or more
          planName = 'Pro Plus';
        }
      }
    } catch (error) {
      console.error('Error fetching line items:', error);
    }

    // Extract payment information
    const payment = {
      id: session.id,
      customerName: session.customer_details?.name || 'Anonymous',
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency?.toUpperCase() || 'USD',
      timestamp: Date.now(),
      email: session.customer_details?.email || undefined,
      plan: planName,
    };

    // Add to in-memory store for immediate display
    paymentsStore.addPayment(payment);
    console.log('✓ Payment added to in-memory store:', payment);

    // Save to Airtable for persistence
    console.log('→ Attempting to save to Airtable...');
    const saved = await createPaymentRecord(payment);
    if (saved) {
      console.log('✓ Payment saved to Airtable successfully!');
    } else {
      console.error('✗ Failed to save payment to Airtable');
    }
  } else {
    console.log('Ignoring event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
