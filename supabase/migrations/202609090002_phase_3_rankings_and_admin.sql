-- Phase 3: public rankings and an admin-only catalogue workflow.
-- Apply after the previous Phase 2 migrations.
--
-- To give yourself catalogue access after registering in the app, run this in
-- the Supabase SQL Editor with your own Auth user UUID:
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';

alter table public.profiles
add column role text not null default 'user' check (role in ('user', 'admin'));

-- A signed-in browser client may update its display name and avatar, but it
-- cannot promote itself. SQL Editor / service contexts have no auth.uid().
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role is distinct from new.role and auth.uid() is not null then
    raise exception 'Profile roles cannot be changed from a signed-in client';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Public aggregate-only views. These intentionally do not expose individual
-- users or their ratings.
create or replace view public.song_rankings
with (security_invoker = false) as
select
  songs.id as song_id,
  songs.title,
  songs.title_japanese,
  songs.release_name,
  songs.release_year,
  songs.duration_seconds,
  artists.id as artist_id,
  artists.name as artist_name,
  artists.name_japanese as artist_name_japanese,
  artists.image_url as artist_image_url,
  coalesce(round(avg(ratings.rating)::numeric, 1), 0)::float8 as average_rating,
  count(ratings.user_id)::integer as rating_count
from public.songs
join public.artists on artists.id = songs.artist_id
left join public.ratings on ratings.song_id = songs.id
group by songs.id, artists.id;

create or replace view public.artist_rankings
with (security_invoker = false) as
with song_totals as (
  select
    songs.artist_id,
    coalesce(sum(ratings.rating), 0)::bigint as rating_total,
    count(ratings.user_id)::integer as rating_count
  from public.songs
  left join public.ratings on ratings.song_id = songs.id
  group by songs.artist_id
), favourite_totals as (
  select artist_id, count(*)::integer as favourite_count
  from public.favourites
  group by artist_id
)
select
  artists.id as artist_id,
  artists.name as artist_name,
  artists.name_japanese as artist_name_japanese,
  artists.image_url as artist_image_url,
  artists.youtube_subscribers,
  artists.spotify_monthly_listeners,
  coalesce(round((song_totals.rating_total::numeric / nullif(song_totals.rating_count, 0)), 1), 0)::float8 as average_rating,
  coalesce(song_totals.rating_count, 0)::integer as rating_count,
  coalesce(favourite_totals.favourite_count, 0)::integer as favourite_count
from public.artists
left join song_totals on song_totals.artist_id = artists.id
left join favourite_totals on favourite_totals.artist_id = artists.id;

revoke all on public.song_rankings, public.artist_rankings from anon, authenticated;
grant select on public.song_rankings, public.artist_rankings to anon, authenticated;

-- Admins can manage all catalogue data from the browser dashboard. Read access
-- remains public and the existing individual-rating/favourite RLS is unchanged.
create policy "Admins manage artists" on public.artists
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins manage genres" on public.genres
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins manage artist genres" on public.artist_genres
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins manage songs" on public.songs
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins manage popularity snapshots" on public.popularity_snapshots
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

insert into storage.buckets (id, name, public)
values ('artist-images', 'artist-images', true)
on conflict (id) do update set public = true;

create policy "Artist images are publicly readable" on storage.objects
for select to public
using (bucket_id = 'artist-images');

create policy "Admins manage artist images" on storage.objects
for all to authenticated
using (bucket_id = 'artist-images' and (select public.is_admin()))
with check (bucket_id = 'artist-images' and (select public.is_admin()));
