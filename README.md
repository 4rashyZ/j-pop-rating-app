# OTO — J-Pop Rating App

A small Phase 2 J-Pop discovery and rating app built with Next.js, TypeScript, and Supabase.

## Features

- Browse six sample artists
- Search and filter artists by genre
- View artist portfolios and sample popularity statistics
- Rate individual songs from 1–10
- Create an email/password account
- Save a personal 1–10 rating for each song
- Save favourite artists to the account
- Display public average ratings and rating counts
- Keep ratings and favourites across browsers and devices
- Upload a personal profile picture from the account menu
- Responsive desktop and mobile layouts

The popularity values are manually maintained demonstration data and are not connected to YouTube or Spotify APIs.

## Run locally

1. Create a free project at [Supabase](https://supabase.com/dashboard).
2. In its **SQL Editor**, run the migrations in filename order: [Phase 2 schema](supabase/migrations/202609080001_phase_2.sql), [profile avatars and artist images](supabase/migrations/202609080002_profile_avatars_and_artist_images.sql), [licensed artist visuals](supabase/migrations/202609080003_add_licensed_artist_visuals.sql), and [catalogue expansion](supabase/migrations/202609090001_expand_artist_catalogue.sql). These create the tables, sample catalogue, profile trigger, Storage bucket, Row Level Security policies, local artist-image mapping, and additional artists.
3. In the Supabase project's **Connect** dialog, copy the Project URL and publishable key.
4. Copy `.env.example` to `.env.local` and add those two values. Do not use or expose a secret/service-role key.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` for local development. Add your deployed site URL later.

Install Node.js 20.9 or newer, then run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

When Supabase email confirmation is enabled, new users must confirm their email before signing in.

## Validation

```powershell
npm run lint
npm run build
```

## Security model

- Everyone can read the artist catalogue and public aggregate song scores.
- A signed-in user can read and change only their own profile, ratings, and favourites.
- Individual ratings are never exposed publicly; only the aggregate view is public.
- Row Level Security protects these rules in the database, not only in the user interface.
