# Collectables System - Setup Guide

## Overview

A new **Collectables** section has been added to Telescope - separate from the Shop. This features a grid of 21 collectable boxes where:
- **Box 1**: Snowdog OG (unlocked, free to claim if eligible)
- **Boxes 2-21**: Locked (coming soon)

## Visual Design

- **Grid Layout**: 7 columns on desktop, responsive on mobile
- **Unlocked boxes**: Show the collectable logo
  - Hover reveals name and "Claim" button
  - Green checkmark badge if already claimed
- **Locked boxes**: Show lock icon, greyed out
- **Simple, clean design**: Just logo + claim button (no descriptions)

## How It Works

### For Eligible Users:
1. Visit `/collectables` page
2. Hover over Snowdog OG box
3. Click "Claim" button
4. System checks if wallet interacted with Snowdog contract in 2021
5. If eligible → Claimed! (green checkmark appears)
6. If not eligible → Error toast notification

### Eligibility Check:
- Queries Snowtrace API for wallet's transaction history
- Checks if wallet sent transactions to `0xde9e52f1838951e4d2bb6c59723b003c353979b6` in 2021
- Real-time verification (happens when user clicks "Claim")

## Files Created

### Frontend
- `/src/app/collectables/page.tsx` - Collectables grid page
- Updated `/src/components/page-navigation.tsx` - Added Collectables nav button

### Backend
- `/src/app/api/collectables/route.ts` - GET collectables API
- `/src/app/api/collectables/claim/route.ts` - POST claim API

### Scripts
- `/scripts/add-snowdog-collectable.ts` - Add Snowdog to database

### Assets
- `/public/collectables/snowdog-og.svg` - Snowdog logo

## Deployment Steps

**IMPORTANT**: The database schema was already updated with `npx prisma db push` earlier.

### Just run this to add Snowdog:

```bash
cd C:\Users\GGPC\Documents\GitHub\telescope
npx tsx scripts/add-snowdog-collectable.ts
```

That's it! The Collectables page will now be live with:
- Snowdog OG in position 1 (unlocked)
- 20 locked boxes (coming soon)

## Current Status

✅ Schema updated (already done)
✅ Frontend page created
✅ API routes created
✅ Navigation added
✅ Snowdog logo created
⏸️ NOT YET ADDED to database (run script when ready)

## Key Differences from Shop

| Feature | Shop | Collectables |
|---------|------|-------------|
| Cost | Coins required | **FREE** (if eligible) |
| Layout | Large cards with descriptions | **Small grid boxes** |
| Display | Limited items for sale | **21 box grid** (1 unlocked + 20 locked) |
| Purpose | Spend coins on rewards | **Collect badges/trophies** |
| Eligibility | Coins balance | **Contract interaction check** |

## Future Collectables

To add more collectables:

1. Create logo SVG in `/public/collectables/`
2. Add to database with script (similar to Snowdog)
3. Update the grid to show it in the next position

The page automatically handles:
- First collectable from DB → Position 1
- Second collectable → Position 2
- etc.
- Remaining positions show locked boxes

## Snowdog Details

- **Name**: Snowdog OG
- **Contract**: `0xde9e52f1838951e4d2bb6c59723b003c353979b6`
- **Chain**: Avalanche C-Chain
- **Required**: Interaction in 2021
- **Cost**: FREE
- **Limit**: Unlimited (for eligible users)

## Testing

To test locally:

1. Run the seed script
2. Visit `http://localhost:3000/collectables`
3. Connect wallet
4. Hover over Snowdog box
5. Click "Claim"
6. Check if your wallet interacted with Snowdog in 2021

## Notes

- Eligibility check happens on claim (not on page load)
- "Checking..." state shown while verifying with Snowtrace API
- Users can only claim once (tracked in database)
- Claimed collectables show green checkmark
- Works with existing user system (no new tables needed)
