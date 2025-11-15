# Subscription Setup Guide

## Overview
The frontend now uses Stripe Price IDs from environment variables to determine which listing types require subscriptions. This approach is more reliable than enum-based checks.

## Environment Variables Required

Add these to your `.env.local` or `.env` file in the `next-frontend` directory:

```env
NEXT_PUBLIC_STRIPE_PRICE_ID_SEMEN=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_STUD=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_FUTURE=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_OTHER_SERVICES=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_FEATURED=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PUPPY_LITTER_WITH_FEATURED=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PUPPY_LITTER_WITHOUT_FEATURED=price_xxxxx
```

## How It Works

1. **Price ID Configuration** (`app/_config/subscription-prices.ts`):
   - Reads Stripe Price IDs from environment variables
   - Provides functions to check if a listing type has a price ID configured
   - If a listing type has a price ID, it's treated as a subscription type

2. **Payment Modal** (`app/_components/payments/listing-payment-modal.tsx`):
   - Uses `hasStripePriceId()` to determine if a listing type needs a subscription
   - If price ID exists → Creates subscription via `/api/v1/subscriptions/stripe/create`
   - If no price ID → Creates one-time payment via `/api/v1/payments/stripe/create-intent`

3. **Forms**:
   - All listing forms check for existing subscriptions before showing payment modal
   - If subscription exists, listing is created directly without payment
   - If no subscription, payment modal is shown

## Benefits

- **Reliable**: Uses actual Stripe Price IDs instead of enum comparisons
- **Configurable**: Easy to add/remove subscription types by setting/unsetting environment variables
- **Consistent**: Frontend and backend use the same price IDs
- **Debugging**: Console logs show which price IDs are configured

## Testing

1. Set up environment variables with your Stripe Price IDs
2. Create a listing of type `OTHER_SERVICES`
3. Check console logs - should show:
   - `hasPriceId: true`
   - `priceId: price_xxxxx`
   - "Creating subscription setup for: OTHER_SERVICES"
4. Payment modal should show "Monthly subscription" instead of "One-time charge"
5. API call should go to `/api/v1/subscriptions/stripe/create` not `/api/v1/payments/stripe/create-intent`

