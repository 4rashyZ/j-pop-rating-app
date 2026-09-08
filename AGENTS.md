# AGENTS.md

## Project overview

OTO is a small Phase 1 J-Pop discovery and rating prototype. It is intended as a learning and demonstration project, so prefer straightforward implementations over production-scale architecture.

The interface uses an original dark music-streaming design inspired by the general visual language of YouTube Music. Do not copy YouTube branding, logos, proprietary assets, or exact layouts.

## Technology

- Next.js App Router
- React
- TypeScript with strict mode
- Plain global CSS in `app/globals.css`
- Browser `localStorage` for ratings and favourites
- Static sample content in `lib/data.ts`

This phase does not use a database, authentication, or external APIs.

## Project structure

- `app/page.tsx`: artist discovery, search, and genre filters
- `app/artists/[id]/page.tsx`: artist portfolio and song ratings
- `app/favourites/page.tsx`: saved favourite artists
- `components/`: shared interface and state components
- `lib/data.ts`: artist and song types plus sample data
- `app/globals.css`: design system, layouts, and responsive styles

## Development commands

Use Node.js 20.9 or newer.

```powershell
npm install
npm run dev
npm run lint
npm run build
```

Before completing a code change, run both `npm run lint` and `npm run build` when Node.js and dependencies are available. If they cannot be run, state the specific environmental limitation in the handoff.

## Coding guidelines

- Keep TypeScript strict and avoid `any`.
- Prefer small reusable components over duplicated markup.
- Use the `@/` import alias for project-root imports.
- Add `"use client"` only to components that require state, effects, event handlers, browser APIs, or client-side navigation hooks.
- Keep browser storage access inside client components and handle unavailable or malformed stored data safely.
- Preserve keyboard access, visible focus behaviour, semantic elements, and descriptive accessible labels.
- Maintain responsive behaviour for desktop and mobile layouts.
- Use CSS custom properties and existing colour tokens before introducing new repeated values.
- Do not introduce a component library or state-management package without a clear need.

## Phase 1 product rules

- A user can assign one rating from 1 through 10 to each song.
- Changing a rating replaces the previous rating.
- A user can add or remove an artist from favourites.
- Ratings and favourites persist only on the current browser and device.
- Search should match artist names, Japanese names, and genres.
- Genre filters and search should work together.
- Popularity figures are sample data and must be labelled as such.

## Content and data

- Keep artist and song identifiers unique and URL-safe.
- Support Japanese characters alongside romanized or international names.
- Avoid implying that sample popularity values are live or officially sourced.
- Do not scrape Spotify, YouTube, or other services.
- Do not add copyrighted artist photographs unless their use and attribution are appropriate. The current abstract CSS artwork is intentional.

## Scope boundaries

Do not add the following unless the user explicitly requests a later phase:

- User registration or login
- Supabase or another database
- YouTube or Spotify API integration
- Administrator dashboards
- Written reviews or comments
- Social features
- Native mobile applications

When expanding the project, preserve existing browser data where practical or clearly document any migration that invalidates it.
