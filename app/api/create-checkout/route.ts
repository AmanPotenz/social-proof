import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export async function POST() {
  try {
    // Get the base URL from the request or use environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    console.log('Creating checkout session with base URL:', baseUrl);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    // Create a checkout session with custom redirect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Product',
              description: 'Social Proof Demo Purchase',
            },
            unit_amount: 1000, // $10.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}?success=true`,
      cancel_url: `${baseUrl}?canceled=true`,
    });

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
