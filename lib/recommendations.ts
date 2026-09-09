import type { Artist } from "@/lib/data";
import type { SongRanking } from "@/lib/rankings";

export type ArtistRecommendation = {
  artist: Artist;
  reason: string;
};

type RecommendationInput = {
  artists: Artist[];
  songs: SongRanking[];
  favouriteArtistIds: string[];
  ratings: Record<string, number>;
  limit?: number;
};

export function getArtistRecommendations({ artists, songs, favouriteArtistIds, ratings, limit = 3 }: RecommendationInput): ArtistRecommendation[] {
  const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
  const preferredArtistIds = new Set(favouriteArtistIds);
  const genreWeights = new Map<string, number>();

  const addGenres = (artistId: string, weight: number) => {
    const artist = artistsById.get(artistId);
    if (!artist) return;
    artist.genres.forEach((genre) => genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + weight));
  };

  favouriteArtistIds.forEach((artistId) => addGenres(artistId, 3));
  songs.forEach((song) => {
    const rating = ratings[song.songId];
    if (!rating || rating < 7) return;
    preferredArtistIds.add(song.artistId);
    addGenres(song.artistId, rating >= 9 ? 3 : 2);
  });

  const hasTasteSignals = genreWeights.size > 0;
  return artists
    .filter((artist) => !preferredArtistIds.has(artist.id))
    .map((artist) => {
      const matchingGenres = artist.genres
        .map((genre) => ({ genre, weight: genreWeights.get(genre) ?? 0 }))
        .filter(({ weight }) => weight > 0)
        .sort((first, second) => second.weight - first.weight);
      const popularity = artist.youtube + artist.spotify;
      const score = matchingGenres.reduce((total, item) => total + item.weight, 0) * 1_000_000_000 + popularity;
      const reason = matchingGenres.length
        ? `${matchingGenres[0].genre} fits your favourites and highly rated songs.`
        : hasTasteSignals
          ? "A popular new sound to add to your rotation."
          : "A popular artist to start your OTO rotation.";
      return { artist, reason, score };
    })
    .sort((first, second) => second.score - first.score || first.artist.name.localeCompare(second.artist.name))
    .slice(0, limit)
    .map(({ artist, reason }) => ({ artist, reason }));
}
