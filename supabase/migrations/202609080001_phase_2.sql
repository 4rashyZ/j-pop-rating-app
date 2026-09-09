-- Phase 2: authenticated ratings and favourites for OTO.
-- Run this migration in the Supabase SQL Editor, or with the Supabase CLI.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.artists (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null unique,
  name_japanese text not null,
  initials text not null check (char_length(initials) between 1 and 3),
  accent text not null check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  accent_soft text not null check (accent_soft ~ '^#[0-9A-Fa-f]{6}$'),
  bio text not null,
  debut_year smallint not null check (debut_year between 1900 and 2100),
  youtube_subscribers bigint not null default 0 check (youtube_subscribers >= 0),
  spotify_monthly_listeners bigint not null default 0 check (spotify_monthly_listeners >= 0),
  created_at timestamptz not null default now()
);

create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 50)
);

create table public.artist_genres (
  artist_id text not null references public.artists(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (artist_id, genre_id)
);

create table public.songs (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  artist_id text not null references public.artists(id) on delete cascade,
  title text not null,
  title_japanese text,
  release_name text not null,
  release_year smallint not null check (release_year between 1900 and 2100),
  duration_seconds smallint not null check (duration_seconds between 1 and 3600),
  created_at timestamptz not null default now()
);

create index songs_artist_id_idx on public.songs(artist_id);

create table public.ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  rating smallint not null check (rating between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create index ratings_song_id_idx on public.ratings(song_id);

create table public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_id text not null references public.artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artist_id)
);

create table public.popularity_snapshots (
  id uuid primary key default gen_random_uuid(),
  artist_id text not null references public.artists(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'spotify')),
  metric text not null check (metric in ('subscribers', 'monthly_listeners')),
  value bigint not null check (value >= 0),
  collected_at timestamptz not null default now(),
  unique (artist_id, platform, metric, collected_at)
);

create index popularity_snapshots_artist_collected_idx on public.popularity_snapshots(artist_id, collected_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ratings_set_updated_at
before update on public.ratings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- The view exposes only public aggregates. Individual rating rows stay private.
create view public.song_rating_summaries
with (security_invoker = false) as
select song_id, round(avg(rating)::numeric, 1)::float8 as average_rating, count(*)::integer as rating_count
from public.ratings
group by song_id;

revoke all on public.profiles, public.artists, public.genres, public.artist_genres, public.songs, public.ratings, public.favourites, public.popularity_snapshots from anon, authenticated;
revoke all on public.song_rating_summaries from anon, authenticated;
grant select on public.artists, public.genres, public.artist_genres, public.songs, public.popularity_snapshots, public.song_rating_summaries to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.ratings, public.favourites to authenticated;

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.genres enable row level security;
alter table public.artist_genres enable row level security;
alter table public.songs enable row level security;
alter table public.ratings enable row level security;
alter table public.favourites enable row level security;
alter table public.popularity_snapshots enable row level security;

create policy "Public catalogue is readable" on public.artists for select to anon, authenticated using (true);
create policy "Public genres are readable" on public.genres for select to anon, authenticated using (true);
create policy "Public artist genres are readable" on public.artist_genres for select to anon, authenticated using (true);
create policy "Public songs are readable" on public.songs for select to anon, authenticated using (true);
create policy "Public popularity snapshots are readable" on public.popularity_snapshots for select to anon, authenticated using (true);

create policy "Users read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users read their own ratings" on public.ratings for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own ratings" on public.ratings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own ratings" on public.ratings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own ratings" on public.ratings for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read their own favourites" on public.favourites for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own favourites" on public.favourites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete their own favourites" on public.favourites for delete to authenticated using ((select auth.uid()) = user_id);

insert into public.artists (id, name, name_japanese, initials, accent, accent_soft, bio, debut_year, youtube_subscribers, spotify_monthly_listeners) values
('yoasobi', 'YOASOBI', 'ヨアソビ', 'YO', '#e24a73', '#53243c', 'A duo built around turning stories into music, pairing vivid electronic production with expressive vocals.', 2019, 7100000, 9800000),
('ado', 'Ado', 'アド', 'AD', '#5271ff', '#202f69', 'A powerhouse vocalist recognised for theatrical performances, dramatic range, and genre-bending pop production.', 2020, 8200000, 6500000),
('fujii-kaze', 'Fujii Kaze', '藤井 風', 'FK', '#e8a64b', '#594326', 'A singer-songwriter and pianist whose relaxed vocals blend pop, soul, jazz, and contemporary R&B.', 2019, 4600000, 7300000),
('atarashii-gakko', 'ATARASHII GAKKO!', '新しい学校のリーダーズ', 'AG', '#28b99b', '#1f504a', 'A four-member group known for high-energy choreography, playful individuality, and adventurous pop sounds.', 2015, 2200000, 3100000),
('kenshi-yonezu', 'Kenshi Yonezu', '米津玄師', 'KY', '#a873e8', '#402d5b', 'A singer-songwriter, producer, and illustrator celebrated for distinctive melodies and imaginative visual worlds.', 2009, 7400000, 5900000),
('aimyon', 'Aimyon', 'あいみょん', 'AM', '#e56743', '#5d3026', 'A singer-songwriter whose direct lyrics and warm guitar-led sound bring an intimate feel to modern pop.', 2015, 2300000, 4800000);

insert into public.genres (name) values ('J-Pop'), ('Electropop'), ('Rock'), ('R&B'), ('Dance'), ('Alternative'), ('Folk Pop');
insert into public.artist_genres (artist_id, genre_id)
select artist_id, genres.id from (values
  ('yoasobi', 'J-Pop'), ('yoasobi', 'Electropop'), ('ado', 'J-Pop'), ('ado', 'Rock'), ('fujii-kaze', 'J-Pop'), ('fujii-kaze', 'R&B'),
  ('atarashii-gakko', 'J-Pop'), ('atarashii-gakko', 'Dance'), ('kenshi-yonezu', 'J-Pop'), ('kenshi-yonezu', 'Alternative'), ('aimyon', 'J-Pop'), ('aimyon', 'Folk Pop')
) as source(artist_id, genre_name) join public.genres on genres.name = source.genre_name;

insert into public.songs (id, artist_id, title, title_japanese, release_name, release_year, duration_seconds) values
('idol', 'yoasobi', 'Idol', 'アイドル', 'Idol', 2023, 213), ('yoru-ni-kakeru', 'yoasobi', 'Racing Into the Night', '夜に駆ける', 'The Book', 2019, 261), ('gunjo', 'yoasobi', 'Blue', '群青', 'The Book', 2020, 248),
('usseewa', 'ado', 'Usseewa', 'うっせぇわ', 'Kyogen', 2020, 206), ('new-genesis', 'ado', 'New Genesis', '新時代', 'Uta''s Songs', 2022, 229), ('show', 'ado', 'Show', '唱', 'Show', 2023, 189),
('shinunoga-e-wa', 'fujii-kaze', 'Shinunoga E-Wa', '死ぬのがいいわ', 'Help Ever Hurt Never', 2020, 186), ('matsuri', 'fujii-kaze', 'Matsuri', 'まつり', 'Love All Serve All', 2022, 225), ('kirari', 'fujii-kaze', 'Kirari', 'きらり', 'Love All Serve All', 2021, 231),
('otona-blue', 'atarashii-gakko', 'Otonablue', 'オトナブルー', 'Ichijikikoku', 2020, 184), ('tokyo-calling', 'atarashii-gakko', 'Tokyo Calling', null, 'AG! Calling', 2023, 190), ('fly-high', 'atarashii-gakko', 'Fly High', null, 'AG! Calling', 2024, 196),
('lemon', 'kenshi-yonezu', 'Lemon', null, 'Stray Sheep', 2018, 256), ('kick-back', 'kenshi-yonezu', 'Kick Back', null, 'Kick Back', 2022, 193), ('lady', 'kenshi-yonezu', 'Lady', null, 'Lady', 2023, 209),
('marigold', 'aimyon', 'Marigold', 'マリーゴールド', 'Momentary Sixth Sense', 2018, 306), ('hadaka-no-kokoro', 'aimyon', 'Naked Heart', '裸の心', 'Heard That There''s Good Pasta', 2020, 296), ('ai-wo-tsutaetaidatoka', 'aimyon', 'I Want to Tell You I Love You', '愛を伝えたいだとか', 'Excitement of Youth', 2017, 235);

insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'youtube', 'subscribers', youtube_subscribers from public.artists;
insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'spotify', 'monthly_listeners', spotify_monthly_listeners from public.artists;
