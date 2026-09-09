-- Apply after the previous Phase 2 migrations.
-- Adds user-supplied local images and three additional artists to the catalogue.

update public.artists set image_url = '/artist-images/ado.webp', image_credit = null, image_source_url = null where id = 'ado';
update public.artists set image_url = '/artist-images/aimyon.png', image_credit = null, image_source_url = null where id = 'aimyon';
update public.artists set image_url = '/artist-images/kenshi-yonezu.jpg', image_credit = null, image_source_url = null where id = 'kenshi-yonezu';

insert into public.artists (id, name, name_japanese, initials, accent, accent_soft, bio, debut_year, youtube_subscribers, spotify_monthly_listeners, image_url) values
  ('lisa', 'LiSA', 'LiSA', 'LS', '#d63267', '#52213a', 'A vocalist known for high-energy J-Pop and rock songs with a strong connection to anime music.', 2011, 2100000, 4200000, '/artist-images/lisa.jpg'),
  ('hikaru-utada', 'Hikaru Utada', '宇多田ヒカル', 'HU', '#4d8bd9', '#213753', 'A singer-songwriter whose catalogue blends J-Pop, R&B, electronic music, and intimate ballads.', 1998, 3100000, 5800000, '/artist-images/hikaru-utada.jpg'),
  ('mrs-green-apple', 'Mrs. GREEN APPLE', 'Mrs. GREEN APPLE', 'MG', '#7fbe45', '#304a27', 'A band known for colourful pop-rock arrangements, soaring vocals, and energetic live-ready songs.', 2013, 4700000, 8800000, '/artist-images/mrs-green-apple.webp');

insert into public.genres (name) values ('J-Rock') on conflict (name) do nothing;

insert into public.artist_genres (artist_id, genre_id)
select source.artist_id, genres.id from (values
  ('lisa', 'J-Pop'), ('lisa', 'J-Rock'),
  ('hikaru-utada', 'J-Pop'), ('hikaru-utada', 'R&B'),
  ('mrs-green-apple', 'J-Pop'), ('mrs-green-apple', 'J-Rock')
) as source(artist_id, genre_name)
join public.genres on genres.name = source.genre_name;

insert into public.songs (id, artist_id, title, title_japanese, release_name, release_year, duration_seconds) values
  ('gurenge', 'lisa', 'Gurenge', '紅蓮華', 'Gurenge', 2019, 235),
  ('homura', 'lisa', 'Homura', '炎', 'Homura', 2020, 277),
  ('crossing-field', 'lisa', 'Crossing Field', 'crossing field', 'Crossing Field', 2012, 264),
  ('automatic', 'hikaru-utada', 'Automatic', 'Automatic', 'First Love', 1998, 300),
  ('first-love', 'hikaru-utada', 'First Love', 'First Love', 'First Love', 1999, 257),
  ('one-last-kiss', 'hikaru-utada', 'One Last Kiss', 'One Last Kiss', 'One Last Kiss', 2021, 264),
  ('inferno', 'mrs-green-apple', 'Inferno', 'インフェルノ', 'Attitude', 2019, 185),
  ('dance-hall', 'mrs-green-apple', 'Dance Hall', 'ダンスホール', 'Dance Hall', 2022, 184),
  ('lilac', 'mrs-green-apple', 'Lilac', 'ライラック', 'Lilac', 2024, 288);

insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'youtube', 'subscribers', youtube_subscribers from public.artists where id in ('lisa', 'hikaru-utada', 'mrs-green-apple');
insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'spotify', 'monthly_listeners', spotify_monthly_listeners from public.artists where id in ('lisa', 'hikaru-utada', 'mrs-green-apple');
