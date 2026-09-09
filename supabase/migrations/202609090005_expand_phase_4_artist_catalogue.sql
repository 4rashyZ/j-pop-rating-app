-- Phase 4 catalogue expansion.
-- Apply after 202609090004_phase_4_reviews_and_moderation.sql.
-- Artist images are user-supplied local assets in public/artist-images.

insert into public.artists (id, name, name_japanese, initials, accent, accent_soft, bio, debut_year, youtube_subscribers, spotify_monthly_listeners, image_url) values
  ('creepy-nuts', 'Creepy Nuts', 'Creepy Nuts', 'CN', '#dc5b25', '#542719', 'A hip-hop duo pairing R-Shitei''s rapid-fire rap with DJ Matsunaga''s inventive turntablism and pop-minded hooks.', 2013, 0, 0, '/artist-images/creepy-nuts.webp'),
  ('the-oral-cigarettes', 'THE ORAL CIGARETTES', 'THE ORAL CIGARETTES', 'TOC', '#c64d5b', '#4d202b', 'A rock band known for sharp guitar lines, energetic melodies, and dramatic live-ready anthems.', 2010, 0, 0, '/artist-images/the-oral-cigarettes.jpg'),
  ('king-gnu', 'King Gnu', 'King Gnu', 'KG', '#d2a247', '#55411e', 'A four-piece group blending alternative rock, pop, soul, and electronic textures into cinematic songs.', 2017, 0, 0, '/artist-images/king-gnu.jpg'),
  ('zutomayo', 'ZUTOMAYO', 'ずっと真夜中でいいのに。', 'ZT', '#5878dc', '#273760', 'A project centred on intricate arrangements, agile vocals, and a distinctive mix of rock, pop, and groove.', 2018, 0, 0, '/artist-images/zutomayo.jpg'),
  ('tuki', 'tuki.', 'tuki.', 'TK', '#9a65c9', '#422c57', 'A young singer-songwriter whose intimate melodies and direct writing quickly found a large online audience.', 2023, 0, 0, '/artist-images/tuki..webp'),
  ('masayoshi-oishi', 'Masayoshi Oishi', '大石昌良', 'MO', '#e16b47', '#5c3126', 'A singer-songwriter and performer recognised for bright, detailed pop songwriting and anime-theme work.', 2008, 0, 0, '/artist-images/masayoshi-oishi.jpg'),
  ('myth-roid', 'MYTH & ROID', 'MYTH & ROID', 'MR', '#4aa596', '#1d4943', 'A music project combining dark electronic production, rock intensity, and dramatic vocal storytelling.', 2015, 0, 0, '/artist-images/myth-&-roid.jpg'),
  ('aimer', 'Aimer', 'エメ', 'AM', '#b353a2', '#4e2449', 'A vocalist with a husky, expressive voice whose work moves between intimate ballads, rock, and anime themes.', 2011, 0, 0, '/artist-images/aimer.webp'),
  ('milet', 'milet', 'ミレイ', 'ML', '#53a0b9', '#214652', 'A singer-songwriter whose sound connects alternative pop, folk, electronic detail, and powerful vocal performances.', 2019, 0, 0, '/artist-images/milet.jpg');

insert into public.genres (name) values ('Hip-Hop'), ('Anime'), ('Pop Rock'), ('Indie Pop') on conflict (name) do nothing;

insert into public.artist_genres (artist_id, genre_id)
select source.artist_id, genres.id from (values
  ('creepy-nuts', 'Hip-Hop'), ('creepy-nuts', 'J-Pop'),
  ('the-oral-cigarettes', 'J-Rock'), ('the-oral-cigarettes', 'Pop Rock'),
  ('king-gnu', 'Alternative'), ('king-gnu', 'J-Rock'),
  ('zutomayo', 'J-Pop'), ('zutomayo', 'Alternative'),
  ('tuki', 'J-Pop'), ('tuki', 'Indie Pop'),
  ('masayoshi-oishi', 'J-Pop'), ('masayoshi-oishi', 'Anime'),
  ('myth-roid', 'J-Rock'), ('myth-roid', 'Anime'),
  ('aimer', 'J-Pop'), ('aimer', 'Anime'),
  ('milet', 'J-Pop'), ('milet', 'Alternative')
) as source(artist_id, genre_name) join public.genres on genres.name = source.genre_name;

insert into public.songs (id, artist_id, title, title_japanese, release_name, release_year, duration_seconds) values
  ('bling-bang-bang-born', 'creepy-nuts', 'Bling-Bang-Bang-Born', 'Bling-Bang-Bang-Born', 'Bling-Bang-Bang-Born', 2024, 168),
  ('otonoke', 'creepy-nuts', 'Otonoke', 'オトノケ', 'Otonoke', 2024, 187),
  ('daten', 'creepy-nuts', 'Daten', '堕天', 'Ensemble Play', 2022, 170),
  ('kyouran-hey-kids', 'the-oral-cigarettes', 'Kyouran Hey Kids!!', '狂乱 Hey Kids!!', 'Fixion', 2015, 250),
  ('black-memory', 'the-oral-cigarettes', 'BLACK MEMORY', 'BLACK MEMORY', 'BLACK MEMORY', 2017, 252),
  ('5150', 'the-oral-cigarettes', '5150', '5150', '5150', 2017, 242),
  ('hakujitsu', 'king-gnu', 'Hakujitsu', '白日', 'Sympa', 2019, 275),
  ('specialz', 'king-gnu', 'SPECIALZ', 'SPECIALZ', 'SPECIALZ', 2023, 235),
  ('ichizu', 'king-gnu', 'Ichizu', '一途', 'Ichizu / Sakayume', 2021, 191),
  ('byoushinwo-kamu', 'zutomayo', 'Byoushinwo Kamu', '秒針を噛む', 'Hisohiso Banashi', 2018, 273),
  ('study-me', 'zutomayo', 'Study Me', 'お勉強しといてよ', 'Gusare', 2020, 242),
  ('kan-saete-kuyashiiwa', 'zutomayo', 'Kan Saete Kuyashiiwa', '勘冴えて悔しいわ', 'Hisohiso Banashi', 2018, 235),
  ('bansanka', 'tuki', 'Bansanka', '晩餐歌', 'Bansanka', 2023, 215),
  ('sakura-kimi-watashi', 'tuki', 'Sakura Kimi Watashi', 'サクラキミワタシ', 'Sakura Kimi Watashi', 2024, 238),
  ('aikotoba', 'tuki', 'Aikotoba', '愛言葉', 'Aikotoba', 2024, 227),
  ('kimi-ja-nakya-dame-mitai', 'masayoshi-oishi', 'Kimi Ja Nakya Dame Mitai', '君じゃなきゃダメみたい', 'Kimi Ja Nakya Dame Mitai', 2014, 235),
  ('otomodachi-film', 'masayoshi-oishi', 'Otomodachi Film', 'オトモダチフィルム', 'Otomodachi Film', 2018, 272),
  ('rakuen-toshi', 'masayoshi-oishi', 'Rakuen Toshi', '楽園都市', 'Rakuen Toshi', 2021, 246),
  ('styx-helix', 'myth-roid', 'STYX HELIX', 'STYX HELIX', 'STYX HELIX', 2016, 283),
  ('jingo-jungle', 'myth-roid', 'JINGO JUNGLE', 'JINGO JUNGLE', 'JINGO JUNGLE', 2017, 229),
  ('voracity', 'myth-roid', 'VORACITY', 'VORACITY', 'VORACITY', 2018, 236),
  ('zankyosanka', 'aimer', 'Zankyosanka', '残響散歌', 'Zankyosanka / Asa ga Kuru', 2021, 182),
  ('kataomoi', 'aimer', 'Kataomoi', 'カタオモイ', 'daydream', 2016, 207),
  ('brave-shine', 'aimer', 'Brave Shine', 'Brave Shine', 'DAWN', 2015, 233),
  ('inside-you', 'milet', 'inside you', 'inside you', 'inside you', 2019, 204),
  ('us', 'milet', 'us', 'us', 'us', 2019, 221),
  ('anytime-anywhere', 'milet', 'Anytime Anywhere', 'Anytime Anywhere', 'Anytime Anywhere', 2023, 236);

insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'youtube', 'subscribers', youtube_subscribers from public.artists where id in ('creepy-nuts', 'the-oral-cigarettes', 'king-gnu', 'zutomayo', 'tuki', 'masayoshi-oishi', 'myth-roid', 'aimer', 'milet');
insert into public.popularity_snapshots (artist_id, platform, metric, value)
select id, 'spotify', 'monthly_listeners', spotify_monthly_listeners from public.artists where id in ('creepy-nuts', 'the-oral-cigarettes', 'king-gnu', 'zutomayo', 'tuki', 'masayoshi-oishi', 'myth-roid', 'aimer', 'milet');
