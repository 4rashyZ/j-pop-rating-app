# AGENTS.md

## Project overview

OTO is a small Phase 2 J-Pop discovery and rating app. It is intended as a learning and demonstration project, so prefer straightforward implementations over production-scale architecture.

The interface uses an original dark music-streaming design inspired by the general visual language of YouTube Music. Do not copy YouTube branding, logos, proprietary assets, or exact layouts.

## Technology

- Next.js App Router
- React
- TypeScript with strict mode
- Plain global CSS in `app/globals.css`
- Supabase Auth for email/password accounts
- Supabase PostgreSQL for the catalogue, ratings, and favourites
- `@supabase/ssr` browser client

The catalogue is seeded by `supabase/migrations/202609080001_phase_2.sql`. Profile avatars and artist-image fields are added by `supabase/migrations/202609080002_profile_avatars_and_artist_images.sql`; licensed Ado and ATARASHII GAKKO! visuals are added by `supabase/migrations/202609080003_add_licensed_artist_visuals.sql`; user-supplied local images and the LiSA, Hikaru Utada, and Mrs. GREEN APPLE catalogue entries are added by `supabase/migrations/202609090001_expand_artist_catalogue.sql`. Popularity figures remain manually maintained sample data; this phase does not use external social-media APIs.

## Project structure

- `app/page.tsx`: artist discovery, search, and genre filters loaded from Supabase
- `app/artists/[id]/page.tsx`: artist portfolio and song ratings
- `app/favourites/page.tsx`: saved favourite artists
- `app/auth/page.tsx`: email/password sign-up and sign-in
- `components/`: shared interface and state components
- `lib/catalog.ts`: catalogue and public rating-summary queries
- `lib/supabase/client.ts`: browser Supabase client
- `lib/data.ts`: shared display types and formatting helpers
- `supabase/migrations/`: reproducible database schema, seed data, grants, and RLS policies
- `app/globals.css`: design system, layouts, and responsive styles

## Development commands

Use Node.js 20.9 or newer.

```powershell
npm install
npm run dev
npm run lint
npm run build
```

Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key before running the app. Never commit `.env.local` or a secret/service-role key.

Before completing a code change, run both `npm run lint` and `npm run build` when Node.js and dependencies are available. If they cannot be run, state the specific environmental limitation in the handoff.

## Coding guidelines

- Keep TypeScript strict and avoid `any`.
- Prefer small reusable components over duplicated markup.
- Use the `@/` import alias for project-root imports.
- Add `"use client"` only to components that require state, effects, event handlers, browser APIs, or client-side navigation hooks.
- Keep browser-only Supabase access inside client components. Do not use privileged Supabase keys in browser code.
- Preserve keyboard access, visible focus behaviour, semantic elements, and descriptive accessible labels.
- Maintain responsive behaviour for desktop and mobile layouts.
- Use CSS custom properties and existing colour tokens before introducing new repeated values.
- Do not introduce a component library or state-management package without a clear need.

## Phase 2 product rules

- A user can assign one rating from 1 through 10 to each song.
- Changing a rating replaces the previous rating.
- A user can add or remove an artist from favourites.
- A signed-in user can upload one image profile picture from the account menu. Avatar objects must stay in the user's own `avatars/<user-id>/` Storage folder.
- Ratings and favourites persist in the signed-in user's account.
- Search should match artist names, Japanese names, and genres.
- Genre filters and search should work together.
- Popularity figures are sample data and must be labelled as such.
- Visitors can read artists, songs, and aggregate song scores without signing in.
- Individual ratings and favourite lists are private to their owners.

## Content and data

- Keep artist and song identifiers unique and URL-safe.
- Support Japanese characters alongside romanized or international names.
- Avoid implying that sample popularity values are live or officially sourced.
- Do not scrape Spotify, YouTube, or other services.
- Do not add copyrighted artist photographs unless their use and attribution are appropriate. The current abstract CSS artwork is intentional.
- Artist image URLs must have an appropriate licence or permission and must include a visible source/credit when attribution is required.
- The migration's Row Level Security policies are required. Do not weaken them to work around client errors.

## Scope boundaries

Do not add the following unless the user explicitly requests a later phase:

- YouTube or Spotify API integration
- Administrator dashboards
- Written reviews or comments
- Social features
- Native mobile applications

When expanding the project, preserve existing browser data where practical or clearly document any migration that invalidates it.
