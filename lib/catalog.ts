import type { Artist, ArtistWithSongs, Song } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

type ArtistRow = {
  id: string;
  name: string;
  name_japanese: string;
  initials: string;
  accent: string;
  accent_soft: string;
  bio: string;
  debut_year: number;
  youtube_subscribers: number;
  spotify_monthly_listeners: number;
  image_url: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  artist_genres?: { genres: { name: string } | null }[] | null;
};

type SongRow = {
  id: string;
  artist_id: string;
  title: string;
  title_japanese: string | null;
  release_name: string;
  release_year: number;
  duration_seconds: number;
};

export type RatingSummary = {
  songId: string;
  averageRating: number;
  ratingCount: number;
};

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function mapArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    name: row.name,
    nameJapanese: row.name_japanese,
    initials: row.initials,
    accent: row.accent,
    accentSoft: row.accent_soft,
    bio: row.bio,
    debut: row.debut_year,
    youtube: Number(row.youtube_subscribers),
    spotify: Number(row.spotify_monthly_listeners),
    imageUrl: row.image_url,
    imageCredit: row.image_credit,
    imageSourceUrl: row.image_source_url,
    genres: row.artist_genres?.flatMap((item) => item.genres ? [item.genres.name] : []) ?? [],
  };
}

function mapSong(row: SongRow): Song {
  return {
    id: row.id,
    artistId: row.artist_id,
    title: row.title,
    titleJapanese: row.title_japanese,
    release: row.release_name,
    year: row.release_year,
    duration: formatDuration(row.duration_seconds),
  };
}

const artistSelect = "id, name, name_japanese, initials, accent, accent_soft, bio, debut_year, youtube_subscribers, spotify_monthly_listeners, image_url, image_credit, image_source_url, artist_genres(genres(name))";

export async function fetchArtists(): Promise<Artist[]> {
  const { data, error } = await createClient().from("artists").select(artistSelect).order("name");
  if (error) throw error;
  return ((data ?? []) as unknown as ArtistRow[]).map(mapArtist);
}

export async function fetchArtistWithSongs(id: string): Promise<ArtistWithSongs | null> {
  const supabase = createClient();
  const { data: artistData, error: artistError } = await supabase.from("artists").select(artistSelect).eq("id", id).maybeSingle();
  if (artistError) throw artistError;
  if (!artistData) return null;

  const { data: songData, error: songError } = await supabase.from("songs").select("id, artist_id, title, title_japanese, release_name, release_year, duration_seconds").eq("artist_id", id).order("release_year", { ascending: false });
  if (songError) throw songError;

  return {
    artist: mapArtist(artistData as unknown as ArtistRow),
    songs: ((songData ?? []) as unknown as SongRow[]).map(mapSong),
  };
}

export async function fetchRatingSummaries(songIds: string[]) {
  if (songIds.length === 0) return new Map<string, RatingSummary>();
  const { data, error } = await createClient().from("song_rating_summaries").select("song_id, average_rating, rating_count").in("song_id", songIds);
  if (error) throw error;
  return new Map(((data ?? []) as { song_id: string; average_rating: number; rating_count: number }[]).map((row) => [row.song_id, {
    songId: row.song_id,
    averageRating: Number(row.average_rating),
    ratingCount: Number(row.rating_count),
  }]));
}
