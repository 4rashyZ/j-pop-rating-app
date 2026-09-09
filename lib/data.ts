export type Song = {
  id: string;
  artistId: string;
  title: string;
  titleJapanese?: string | null;
  release: string;
  year: number;
  duration: string;
};

export type Artist = {
  id: string;
  name: string;
  nameJapanese: string;
  initials: string;
  accent: string;
  accentSoft: string;
  genres: string[];
  bio: string;
  debut: number;
  youtube: number;
  spotify: number;
  imageUrl: string | null;
  imageCredit: string | null;
  imageSourceUrl: string | null;
};

export type ArtistWithSongs = {
  artist: Artist;
  songs: Song[];
};

export function formatAudience(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return value.toString();
}
