# Airtable Setup Guide

This guide will help you set up Airtable to store your payment notifications.

## Step 1: Create an Airtable Account

1. Go to https://airtable.com and sign up for a free account
2. Once logged in, click "Create a base" or use an existing base

## Step 2: Create the Payments Table

1. **Create a new table** called "Payments" (or any name you prefer)
2. **Add the following fields** to your table:

   | Field Name | Field Type | Required |
   |------------|------------|----------|
   | sessionId | Single line text | Yes |
   | customerName | Single line text | Yes |
   | amount | Number | Yes |
   | currency | Single line text | Yes |
   | email | Email | No |
   | timestamp | Date | Yes |

3. **Configure the fields**:
   - **amount**: Set precision to 2 decimal places
   - **timestamp**: Enable "Include time"

## Step 3: Get Your Airtable Credentials

### Get Personal Access Token (NEW - API Keys are deprecated)
1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Give it a name (e.g., "Social Proof Widget")
4. Under **Scopes**, add:
   - `data.records:read`
   - `data.records:write`
5. Under **Access**, select your base
6. Click "Create token"
7. **IMPORTANT**: Copy the token immediately (starts with `pat...`) - you won't see it again!

### Get Base ID
1. Open your Airtable base
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy the part that starts with `app...` (e.g., `appABCDEF12345678`)

### Get Table Name
- Use the exact name of your table (default: "Payments")

## Step 4: Update Your Environment Variables

Add these to your `.env.local` file:

```env
AIRTABLE_ACCESS_TOKEN=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Payments
```

## Step 5: Test Locally

1. Restart your dev server: `npm run dev`
2. Visit http://localhost:3000
3. Make a test payment
4. Check your Airtable base - you should see a new record!

## Step 6: Deploy to Vercel

Add the same environment variables to Vercel:

```bash
vercel env add AIRTABLE_ACCESS_TOKEN production
vercel env add AIRTABLE_BASE_ID production
vercel env add AIRTABLE_TABLE_NAME production
```

Or add them through the Vercel dashboard:
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable

## Benefits of Airtable

✅ **Simple REST API**: Easy to integrate, no complex authentication
✅ **Visual Interface**: View and manage your data in a spreadsheet
✅ **Free Tier**: 1,200 records per base (plenty for most use cases)
✅ **Reliable**: No weird authentication errors
✅ **Flexible**: Easy to add custom fields later

## Troubleshooting

### "Airtable credentials not configured"
- Make sure all three env variables are set
- Restart your dev server after adding them

### "Could not find table"
- Check that `AIRTABLE_TABLE_NAME` matches exactly (case-sensitive)
- Make sure you're using the table name, not the base name

### "Invalid API key" or "Authentication failed"
- Generate a new Personal Access Token at https://airtable.com/create/tokens
- Make sure you've granted `data.records:read` and `data.records:write` scopes
- Make sure you've granted access to the correct base
- Ensure there are no extra spaces in your `.env.local` file

### "Field not found"
- Ensure all required fields exist in your Airtable table
- Field names must match exactly (case-sensitive)

## Example Airtable View

After a few payments, your Airtable will look like this:

| sessionId | customerName | amount | currency | email | timestamp |
|-----------|--------------|--------|----------|-------|-----------|
| cs_test_... | John Doe | 99.00 | USD | john@example.com | 2025-10-28 10:30 |
| cs_test_... | Jane Smith | 149.00 | USD | jane@example.com | 2025-10-28 10:25 |

You can sort, filter, and analyze your payments directly in Airtable!
