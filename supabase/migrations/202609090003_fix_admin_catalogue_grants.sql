-- Phase 3 follow-up: RLS policies do not replace PostgreSQL table privileges.
-- Apply after 202609090002_phase_3_rankings_and_admin.sql.
-- These grants permit requests to reach the existing admin-only RLS policies;
-- non-admin users remain unable to write catalogue data.

grant insert, update, delete on public.artists to authenticated;
grant insert, update, delete on public.genres to authenticated;
grant insert, update, delete on public.artist_genres to authenticated;
grant insert, update, delete on public.songs to authenticated;
grant insert, update, delete on public.popularity_snapshots to authenticated;
