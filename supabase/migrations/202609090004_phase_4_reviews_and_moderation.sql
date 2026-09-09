-- Phase 4: song reviews, reports, and administrator moderation.
-- Apply after 202609090003_fix_admin_catalogue_grants.sql.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 10 and 1000),
  status text not null default 'published' check (status in ('published', 'hidden')),
  moderation_reason text check (moderation_reason is null or char_length(moderation_reason) between 3 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create index reviews_song_status_updated_idx on public.reviews(song_id, status, updated_at desc);

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.require_rating_before_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.ratings
    where user_id = new.user_id and song_id = new.song_id
  ) then
    raise exception 'Rate this song before writing a review';
  end if;
  return new;
end;
$$;

create trigger reviews_require_rating
before insert or update of user_id, song_id on public.reviews
for each row execute function public.require_rating_before_review();

create table public.review_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (reporter_id, review_id)
);

create index review_reports_review_status_idx on public.review_reports(review_id, status);

create or replace function public.is_published_review(target_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.reviews
    where id = target_review_id and status = 'published'
  );
$$;

revoke all on function public.is_published_review(uuid) from public;
grant execute on function public.is_published_review(uuid) to authenticated;

-- Public view deliberately omits user IDs and emails.
create view public.published_reviews
with (security_invoker = false) as
select
  reviews.id as review_id,
  reviews.song_id,
  reviews.body,
  reviews.created_at,
  reviews.updated_at,
  profiles.display_name,
  profiles.avatar_url,
  ratings.rating
from public.reviews
join public.profiles on profiles.id = reviews.user_id
join public.ratings on ratings.user_id = reviews.user_id and ratings.song_id = reviews.song_id
where reviews.status = 'published';

-- This view returns rows only when the requesting JWT belongs to an admin.
create view public.admin_review_queue
with (security_invoker = false) as
select
  reviews.id as review_id,
  reviews.song_id,
  songs.title as song_title,
  artists.name as artist_name,
  profiles.display_name,
  reviews.body,
  reviews.status,
  reviews.moderation_reason,
  reviews.created_at,
  reviews.updated_at,
  ratings.rating,
  count(review_reports.id) filter (where review_reports.status = 'open')::integer as open_report_count
from public.reviews
join public.songs on songs.id = reviews.song_id
join public.artists on artists.id = songs.artist_id
join public.profiles on profiles.id = reviews.user_id
join public.ratings on ratings.user_id = reviews.user_id and ratings.song_id = reviews.song_id
left join public.review_reports on review_reports.review_id = reviews.id
where public.is_admin()
group by reviews.id, songs.id, artists.id, profiles.id, ratings.rating;

revoke all on public.reviews, public.review_reports from anon, authenticated;
revoke all on public.published_reviews, public.admin_review_queue from anon, authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.review_reports to authenticated;
grant select on public.published_reviews to anon, authenticated;
grant select on public.admin_review_queue to authenticated;

alter table public.reviews enable row level security;
alter table public.review_reports enable row level security;

create policy "Users read their own reviews" on public.reviews
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create published reviews" on public.reviews
for insert to authenticated with check ((select auth.uid()) = user_id and status = 'published' and moderation_reason is null);
create policy "Users update their own published reviews" on public.reviews
for update to authenticated using ((select auth.uid()) = user_id and status = 'published')
with check ((select auth.uid()) = user_id and status = 'published' and moderation_reason is null);
create policy "Users delete their own reviews" on public.reviews
for delete to authenticated using ((select auth.uid()) = user_id);
create policy "Admins manage reviews" on public.reviews
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Users read their own reports" on public.review_reports
for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "Users report published reviews" on public.review_reports
for insert to authenticated with check (
  (select auth.uid()) = reporter_id
  and status = 'open'
  and public.is_published_review(review_id)
);
create policy "Admins manage reports" on public.review_reports
for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
