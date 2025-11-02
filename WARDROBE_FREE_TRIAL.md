# Wardrobe Ideas Free Trial Feature

## Overview
The Wardrobe Ideas feature now includes a free trial system that allows users to generate 1 AI-powered outfit combination for free. Admin users have unlimited access.

## Implementation Details

### Database Changes
- **Prisma Schema**: Added two new fields to the `UserLimit` model:
  - `wardrobeOutfitsGenerated`: Tracks the number of wardrobe outfit combinations a user has generated
  - `tierLimitWardrobeOutfits`: Defines the limit (default: 1 for free tier)

### API Endpoints

1. **GET `/api/user/wardrobe-count`**
   - Returns the current usage count and limit for wardrobe outfit generation
   - Returns unlimited (999) for admin users
   - Returns unlimited (999) for demo users

2. **POST `/api/user/increment-wardrobe`**
   - Increments the wardrobe outfit generation counter after successful generation
   - Skips incrementing for admin and demo users

### Frontend Changes

**WardrobeUploader Component** (`/components/WardrobeUploader.tsx`):
- Added state management for tracking usage:
  - `wardrobeOutfitsGenerated`: Current count
  - `wardrobeOutfitsLimit`: Maximum allowed
  - `showUpgradePrompt`: Controls upgrade modal visibility

- **Free Trial Banner**: 
  - Shows remaining free generations
  - Displays "Free Trial Used" when limit is reached
  - Shows "Upgrade Now" button when limit is exceeded
  - Hidden for admin users (limit = 999)

- **Upgrade Prompt Modal**:
  - Appears when user tries to generate outfits after exceeding limit
  - Provides clear call-to-action to upgrade
  - Can be dismissed with "Maybe Later" button

- **Limit Check**:
  - Validates usage before allowing file upload
  - Shows upgrade prompt if limit exceeded

### User Experience Flow

1. **First Visit**: User sees "🎁 Free Trial: 1 AI Outfit Generation Remaining"
2. **Upload & Generate**: User uploads clothing items and generates outfit combinations
3. **Counter Increments**: After successful generation, counter updates to 1/1
4. **Limit Reached**: Banner shows "🎁 Free Trial Used" with upgrade button
5. **Subsequent Attempts**: Clicking upload triggers upgrade prompt modal

### Admin Users
- Admin users (flagged with `isAdmin: true` in database) have unlimited access
- No banner or prompts shown for admin users
- Counter doesn't increment for admin users

### Testing

To test the feature:
1. Create a regular user account (non-admin)
2. Navigate to `/wardrobe-ideas`
3. Upload clothing items (up to 12 images)
4. Generate outfit combinations
5. Try to upload again - should see upgrade prompt
6. Login as admin to verify unlimited access

### Reset Usage Count

Admins can reset a user's wardrobe outfit generation count via the admin dashboard:
1. Navigate to `/admin`
2. Find the user
3. Reset `wardrobeOutfitsGenerated` to 0 in the database

## Files Modified

- `prisma/schema.prisma` - Added tracking fields
- `components/WardrobeUploader.tsx` - Added limit checking and UI
- `app/api/user/wardrobe-count/route.ts` - New API endpoint
- `app/api/user/increment-wardrobe/route.ts` - New API endpoint

## Future Enhancements

- Add tiered limits (e.g., 5 for premium, unlimited for pro)
- Add monthly reset functionality
- Track individual outfit saves vs. generations
- Analytics dashboard for usage patterns


