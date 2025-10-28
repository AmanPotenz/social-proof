# Social Proof Dashboard Setup Guide

This is a real-time social proof dashboard that displays Stripe payment successes as inline blocks.

## Features

- Real-time payment tracking with 5-second polling
- Beautiful glassmorphic UI with gradient backgrounds
- Inline payment blocks (no popups)
- Shows customer name, email, amount, and time
- Stats dashboard showing total purchases, revenue, and latest purchase

## Setup Instructions

### 1. Add Your Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Open `.env.local` and paste it:

```
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

### 2. Set Up Stripe Webhook (for production)

For local development, you can skip the webhook secret and the app will work with manual testing.

For production or proper webhook testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhook`
3. Copy the webhook signing secret (starts with `whsec_`)
4. Add to `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Configure Stripe Webhook in Dashboard (Production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter your URL: `https://yourdomain.com/api/webhook`
4. Select events to listen to: `checkout.session.completed`
5. Copy the signing secret and add to `.env.local`

### 4. Test the Payment Flow

1. Start the dev server: `npm run dev`
2. Visit http://localhost:3000
3. Click "Make Test Purchase" or go directly to your payment link
4. Use Stripe test card: `4242 4242 4242 4242` with any future date and CVC
5. Complete the purchase
6. The payment should appear on the dashboard within 5 seconds!

## How It Works

1. **Webhook Endpoint** (`/api/webhook`) - Receives Stripe events when payments succeed
2. **In-Memory Store** (`lib/payments-store.ts`) - Stores the last 50 payments
3. **Payments API** (`/api/payments`) - Returns recent payments to the frontend
4. **Frontend** (`app/page.tsx`) - Polls the API every 5 seconds and displays payments as inline blocks

## Notes

- Payments are stored in-memory, so they'll be lost when the server restarts
- For production, consider using a database (PostgreSQL, MongoDB, etc.)
- The webhook secret is optional for development but required for production
- Test mode payments will only show test purchases, not real ones

## Troubleshooting

**Payments not showing up?**
- Check that STRIPE_SECRET_KEY is set correctly
- Check the browser console for errors
- Check your terminal for webhook errors
- Make sure you completed the checkout successfully

**Webhook errors?**
- For local testing, you can leave STRIPE_WEBHOOK_SECRET empty
- For production, make sure the webhook is properly configured in Stripe Dashboard

## Your Payment Link

Your test payment link: https://buy.stripe.com/test_14AeVf22pgPcgmI7ss
