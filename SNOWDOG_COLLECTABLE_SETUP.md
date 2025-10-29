# Snowdog OG Collectable Setup Guide

This guide explains how to add the Snowdog OG limited-time collectable to the Telescope shop.

## What Was Added

### 1. Database Schema Updates
- Added fields to the `Reward` model in `prisma/schema.prisma`:
  - `limitedTime`: Boolean flag for limited-time offers
  - `availableUntil`: DateTime for when the offer expires
  - `contractAddress`: Avalanche contract address to verify user interaction
  - `requiredYear`: Year when user must have interacted with the contract

### 2. Assets
- Created Snowdog OG logo: `/public/collectables/snowdog-og.svg`
  - Custom SVG featuring a husky/wolf with snowflake design
  - "2021 OG" badge included
  - Avalanche blue color scheme

### 3. Frontend Updates
- Updated `/src/app/shop/page.tsx`:
  - Added "LIMITED TIME" badge with animation
  - Added countdown timer showing days/hours/minutes remaining
  - Added contract requirement notice for eligible users
  - Displays time remaining prominently

### 4. Database Seed Script
- Created `/scripts/add-snowdog-collectable.ts` to easily add the collectable

## Deployment Steps

### Step 1: Run Prisma Migration

First, generate and apply the database schema changes:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Push schema changes to database
npx prisma db push
```

### Step 2: Add Snowdog Collectable to Database

Run the seed script to add the Snowdog OG collectable:

```bash
npx tsx scripts/add-snowdog-collectable.ts
```

This will create a reward with:
- **Name**: Snowdog OG
- **Description**: Exclusive collectable for 2021 Snowdog participants
- **Image**: `/collectables/snowdog-og.svg`
- **Cost**: 100 coins (configurable in script)
- **Total Available**: 50 (configurable in script)
- **Duration**: 7 days from creation
- **Contract**: `0xde9e52f1838951e4d2bb6c59723b003c353979b6` (Snowdog DAO on Avalanche)
- **Required Year**: 2021

### Step 3: Verify Deployment

1. Visit your shop page: `https://your-domain.com/shop`
2. You should see the Snowdog OG collectable with:
   - ⏰ "LIMITED TIME" badge
   - Countdown timer showing time remaining
   - Blue notice about contract requirement
   - Snowdog logo image

## Customization Options

You can edit the script `/scripts/add-snowdog-collectable.ts` to customize:

### Price (in coins)
```typescript
xpRequired: 100,  // Change this number
```

### Quantity Available
```typescript
totalAvailable: 50,  // Change this number
```

### Duration
```typescript
const availableUntil = new Date();
availableUntil.setDate(availableUntil.getDate() + 7);  // Change +7 to desired days
```

### Contract Address & Year
```typescript
contractAddress: '0xde9e52f1838951e4d2bb6c59723b003c353979b6',
requiredYear: 2021,
```

## How It Works

### For Users:
1. Users visit the Shop
2. See the Snowdog OG collectable with LIMITED TIME badge
3. Countdown timer shows urgency (e.g., "6d 23h remaining")
4. Blue notice indicates they must have interacted with Snowdog contract in 2021
5. Click "Buy Now" to claim (deducts coins from their balance)
6. Can only claim once per wallet

### Contract Verification:
Currently the contract verification is displayed as a requirement notice. To implement actual on-chain verification, you would need to:

1. Add a verification step in the claim API (`/src/app/api/rewards/claim/route.ts`)
2. Query Snowtrace API or use an Avalanche node to check transaction history
3. Verify the wallet interacted with the contract address in the specified year
4. Reject claim if verification fails

Example verification code (to add to claim API):

```typescript
// Check if reward requires contract verification
if (reward.contractAddress && reward.requiredYear) {
  const hasInteracted = await checkContractInteraction(
    walletAddress,
    reward.contractAddress,
    reward.requiredYear
  );

  if (!hasInteracted) {
    return NextResponse.json(
      { error: `Must have interacted with contract in ${reward.requiredYear}` },
      { status: 403 }
    );
  }
}
```

## Profile Integration

Currently, claimed rewards can be viewed in the admin claims dashboard at `/admin/claims`.

To show collectables in user profiles:
1. Update `/src/app/profile/[address]/page.tsx`
2. Add a "Collectables" section
3. Query claimed rewards for the user
4. Display them with images and claim dates

## Notes

- The 7-day timer starts from when you run the seed script
- After expiration, the item will still appear but cannot be claimed
- You can manually update `availableUntil` in the database to extend the offer
- The Snowdog logo is vector SVG and will scale perfectly at any size

## Snowdog Contract Details

- **Contract**: `0xde9e52f1838951e4d2bb6c59723b003c353979b6`
- **Chain**: Avalanche C-Chain
- **Token**: SDOG (Snowdog DAO)
- **Year**: November 2021
- **Explorer**: [View on Snowtrace](https://snowtrace.io/token/0xde9e52f1838951e4d2bb6c59723b003c353979b6)

## Troubleshooting

### Migration fails
- Make sure your `DATABASE_URL` in `.env` is correct
- Check MongoDB connection is working

### Image doesn't show
- Verify `/public/collectables/snowdog-og.svg` exists
- Check Next.js image configuration in `next.config.mjs` allows localhost/public images

### Countdown doesn't update
- The countdown uses client-side JavaScript
- Make sure the `availableUntil` field is set correctly in the database

## Future Enhancements

Consider adding:
1. Real-time countdown updates (currently recalculates on render)
2. Actual blockchain verification via Snowtrace API
3. Discord notifications when limited items are about to expire
4. Email notifications for users who are eligible
5. Profile "Collectables" showcase page
6. Rarity tiers for different limited-time items
