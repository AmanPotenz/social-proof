# Stripe Redirect Configuration

## Option 1: Configure Existing Payment Link (Quick)

To make your existing Stripe payment link redirect back to your site after successful payment:

1. Go to https://dashboard.stripe.com/test/payment-links
2. Find your payment link that ends with `...gmI7K54AU00`
3. Click on it to edit
4. Scroll to "After payment" section
5. Select "Redirect to a page"
6. Enter your production URL: `https://social-proof-i7rsctky4-aman-potenzs-projects.vercel.app`
7. Click "Save changes"

## Option 2: Use Custom Checkout (More Control)

Use the new `/api/create-checkout` endpoint that gives you full control over the redirect URL.

### Usage:
```javascript
// In your frontend
const response = await fetch('/api/create-checkout', {
  method: 'POST',
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

This automatically redirects back to your main site after successful payment.

## Current Setup

✅ Payments are now saved to Memberstack data table: `stripe_payments`
✅ Webhook saves payment data for persistence
✅ Payment API fetches from Memberstack
✅ Data survives server restarts

You can view and filter payments in your Memberstack dashboard at:
https://dashboard.memberstack.com/data-tables/tbl_cmhabevx800050sff5ap65nlr
