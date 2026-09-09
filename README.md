# OTO — J-Pop Rating App

A small Phase 3 J-Pop discovery and rating app built with Next.js, TypeScript, and Supabase.

## Features

- Browse a growing sample catalogue of J-Pop artists
- Search and filter artists by genre
- View artist portfolios and sample popularity statistics
- Rate individual songs from 1–10
- Create an email/password account
- Save a personal 1–10 rating for each song
- Save favourite artists to the account
- Display public average ratings and rating counts
- Keep ratings and favourites across browsers and devices
- Upload a personal profile picture from the account menu
- Update a display name and revisit a private rating history
- Browse public song and artist ranking charts without exposing individual ratings
- Use a role-protected catalogue editor for artists, songs, images, genres, and sample audience figures
- Responsive desktop and mobile layouts

The popularity values are manually maintained demonstration data and are not connected to YouTube or Spotify APIs.

## Run locally

1. Create a free project at [Supabase](https://supabase.com/dashboard).
2. In its **SQL Editor**, run the migrations in filename order: [Phase 2 schema](supabase/migrations/202609080001_phase_2.sql), [profile avatars and artist images](supabase/migrations/202609080002_profile_avatars_and_artist_images.sql), [licensed artist visuals](supabase/migrations/202609080003_add_licensed_artist_visuals.sql), [catalogue expansion](supabase/migrations/202609090001_expand_artist_catalogue.sql), [Phase 3 rankings and admin roles](supabase/migrations/202609090002_phase_3_rankings_and_admin.sql), and [admin catalogue grants](supabase/migrations/202609090003_fix_admin_catalogue_grants.sql). These create the tables, sample catalogue, profile trigger, Storage buckets, ranking views, Row Level Security policies, and catalogue-management permissions.
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

## Give yourself catalogue-admin access

First create and sign in to your normal app account. In Supabase **Authentication → Users**, copy that user's UUID. Then open **SQL Editor** and run:

```sql
update public.profiles
set role = 'admin'
where id = 'paste-your-auth-user-uuid-here';
```

Sign out and sign in again. **Catalogue admin** will appear in the account menu. This is deliberately a manual step: app users cannot promote themselves.

## Validation

```powershell
npm run lint
npm run build
```

## Security model

- Everyone can read the artist catalogue and public aggregate song scores.
- A signed-in user can read and change only their own profile, ratings, and favourites.
- Individual ratings are never exposed publicly; only the aggregate view is public.
- The ranking views expose only averages and counts; names, emails, and individual scores remain private.
- Catalogue changes and artist-image uploads require the database `admin` role, enforced with Row Level Security.
- Row Level Security protects these rules in the database, not only in the user interface.
