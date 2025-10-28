# Public Social Proof Widget - How It Works

This application is designed to be a **public social proof widget** that displays real-time payment notifications without requiring any user authentication.

## Architecture Overview

### Shared Member Approach

Instead of requiring individual user accounts, we use a **single shared member account** to store all payment data:

- **Shared Account**: `shared@socialproof.app`
- **Member ID**: `mem_cmhafuj0o00000sff0gfd9ss2`

### How It Works

1. **Public Read Access**
   - The Memberstack data table `stripe_payments` is configured with `readRule: PUBLIC`
   - Anyone visiting your website can see the payment notifications
   - No login or authentication required for visitors

2. **Admin-Only Write Access**
   - The data table has `createRule: ADMIN_ONLY`
   - Only the backend API (using the admin secret key) can create new records
   - This happens automatically when Stripe webhooks are received

3. **Data Flow**
   ```
   Customer makes payment on Stripe
        ↓
   Stripe sends webhook to /api/webhook
        ↓
   Backend creates record using Admin API
        ↓
   Data stored in Memberstack (under shared account)
        ↓
   Frontend fetches data (no auth required)
        ↓
   Notification displayed to all visitors
   ```

## Benefits of This Approach

1. **Zero Authentication Barrier**: Visitors see live notifications immediately, no signup needed
2. **Centralized Data**: All payment records stored under one shared account for easy management
3. **Secure Write Operations**: Only your backend can add data, preventing spam or malicious entries
4. **Public Read Access**: Maximum visibility and social proof impact
5. **Real-time Updates**: Frontend polls every 5 seconds to show latest payments

## Configuration

The shared member ID is configured in `.env.local`:

```env
MEMBERSTACK_SHARED_MEMBER_ID=mem_cmhafuj0o00000sff0gfd9ss2
```

## Data Table Configuration

The `stripe_payments` table in Memberstack:
- **ID**: `tbl_cmhabevx800050sff5ap65nlr`
- **Key**: `stripe_payments`
- **Read Rule**: `PUBLIC` (anyone can read)
- **Create Rule**: `ADMIN_ONLY` (only API can create)
- **Update Rule**: `ADMIN_ONLY`
- **Delete Rule**: `ADMIN_ONLY`

## Frontend Implementation

The frontend (`app/page.tsx`) is completely public:
- No authentication checks
- No login forms
- Direct API calls to `/api/payments`
- Automatic polling every 5 seconds
- Works for any visitor to the site

## Security Considerations

1. **Read Access**: Public by design - this is a feature, not a bug
2. **Write Access**: Protected by admin API key in backend only
3. **Webhook Verification**: Stripe signature verification prevents fake webhooks
4. **No Sensitive Data**: Only displays what you want public (names, amounts, timestamps)

## Deployment Notes

When deploying to production (e.g., Vercel):
1. Set all environment variables in Vercel dashboard
2. Update `NEXT_PUBLIC_BASE_URL` to your production domain
3. Update Stripe webhook endpoint to point to your production URL
4. The public access model works the same in production

## Alternative Approaches Considered

1. **Individual Member Accounts**: Would require login - defeats the purpose of public social proof
2. **No Database**: In-memory only - loses data on restart, no persistence
3. **Custom Database**: More complex - Memberstack provides built-in data tables with flexible access control

The shared member approach is the optimal solution for a public social proof widget.
