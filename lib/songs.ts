import { fetchArtists } from "@/lib/catalog";
import type { Artist } from "@/lib/data";
import { fetchSongRankings, type SongRanking } from "@/lib/rankings";

export type SongCatalogueItem = SongRanking & { genres: string[] };
export type SongDetails = SongCatalogueItem & { artist: Artist };

export async function fetchSongCatalogue(): Promise<SongCatalogueItem[]> {
  const [songs, artists] = await Promise.all([fetchSongRankings(), fetchArtists()]);
  const genresByArtist = new Map(artists.map((artist) => [artist.id, artist.genres]));
  return songs.map((song) => ({ ...song, genres: genresByArtist.get(song.artistId) ?? [] }));
}

export async function fetchSongDetails(id: string): Promise<SongDetails | null> {
  const [songs, artists] = await Promise.all([fetchSongRankings(), fetchArtists()]);
  const song = songs.find((entry) => entry.songId === id);
  if (!song) return null;
  const artist = artists.find((entry) => entry.id === song.artistId);
  if (!artist) return null;
  return { ...song, genres: artist.genres, artist };
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
