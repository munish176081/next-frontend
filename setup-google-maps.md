# Google Maps API Setup Guide

## Quick Fix for Localhost Error

The error you're seeing is because your Google Maps API key is not configured to allow requests from `localhost:3000`.

## Option 1: Update API Key Settings (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services > Credentials**
4. Find your API key: `AIzaSyDf0nuXtOo8kR-4iUlZcvGPvH85fflIJPg`
5. Click on the API key to edit it
6. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     https://yourdomain.com/*
     ```
7. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable these APIs:
     - Maps JavaScript API
     - Places API
8. Click **"Save"**

## Option 2: Create Environment Variable

Create a `.env.local` file in the `next-frontend` directory with:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDf0nuXtOo8kR-4iUlZcvGPvH85fflIJPg
```

## Option 3: Create Development API Key

If you want to keep your production key restricted:

1. Create a new API key in Google Cloud Console
2. Set it to allow all referrers (for development only)
3. Use this key in your `.env.local` file

## Testing

After making changes:
1. Restart your development server
2. Clear your browser cache
3. Try accessing the location fields again

The location autocomplete should now work properly on localhost! 