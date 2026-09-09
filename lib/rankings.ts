import { createClient } from "@/lib/supabase/client";

export type SongRanking = {
  songId: string;
  title: string;
  titleJapanese: string | null;
  releaseName: string;
  releaseYear: number;
  artistId: string;
  artistName: string;
  artistNameJapanese: string;
  artistImageUrl: string | null;
  averageRating: number;
  ratingCount: number;
};

export type ArtistRanking = {
  artistId: string;
  artistName: string;
  artistNameJapanese: string;
  artistImageUrl: string | null;
  youtubeSubscribers: number;
  spotifyMonthlyListeners: number;
  averageRating: number;
  ratingCount: number;
  favouriteCount: number;
};

export async function fetchSongRankings(): Promise<SongRanking[]> {
  const { data, error } = await createClient().from("song_rankings").select("*");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    songId: row.song_id as string,
    title: row.title as string,
    titleJapanese: row.title_japanese as string | null,
    releaseName: row.release_name as string,
    releaseYear: Number(row.release_year),
    artistId: row.artist_id as string,
    artistName: row.artist_name as string,
    artistNameJapanese: row.artist_name_japanese as string,
    artistImageUrl: row.artist_image_url as string | null,
    averageRating: Number(row.average_rating),
    ratingCount: Number(row.rating_count),
  }));
}

export async function fetchArtistRankings(): Promise<ArtistRanking[]> {
  const { data, error } = await createClient().from("artist_rankings").select("*");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    artistId: row.artist_id as string,
    artistName: row.artist_name as string,
    artistNameJapanese: row.artist_name_japanese as string,
    artistImageUrl: row.artist_image_url as string | null,
    youtubeSubscribers: Number(row.youtube_subscribers),
    spotifyMonthlyListeners: Number(row.spotify_monthly_listeners),
    averageRating: Number(row.average_rating),
    ratingCount: Number(row.rating_count),
    favouriteCount: Number(row.favourite_count),
  }));
}
