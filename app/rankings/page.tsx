"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchArtistRankings, fetchSongRankings, type ArtistRanking, type SongRanking } from "@/lib/rankings";
import { formatAudience } from "@/lib/data";

type RankingTab = "songs" | "artists";
type SongSort = "rating" | "votes";
type ArtistSort = "rating" | "favourites" | "popularity";

export default function RankingsPage() {
  const [tab, setTab] = useState<RankingTab>("songs");
  const [songs, setSongs] = useState<SongRanking[]>([]);
  const [artists, setArtists] = useState<ArtistRanking[]>([]);
  const [minimumRatings, setMinimumRatings] = useState(1);
  const [songSort, setSongSort] = useState<SongSort>("rating");
  const [artistSort, setArtistSort] = useState<ArtistSort>("rating");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      try {
        const [songRows, artistRows] = await Promise.all([fetchSongRankings(), fetchArtistRankings()]);
        setSongs(songRows);
        setArtists(artistRows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load rankings.");
      } finally {
        setLoading(false);
      }
    };
    void loadRankings();
  }, []);

  const rankedSongs = useMemo(() => songs
    .filter((song) => song.ratingCount >= minimumRatings)
    .sort((first, second) => songSort === "votes"
      ? second.ratingCount - first.ratingCount || second.averageRating - first.averageRating
      : second.averageRating - first.averageRating || second.ratingCount - first.ratingCount), [songs, minimumRatings, songSort]);

  const rankedArtists = useMemo(() => artists
    .filter((artist) => artist.ratingCount >= minimumRatings)
    .sort((first, second) => {
      if (artistSort === "favourites") return second.favouriteCount - first.favouriteCount || second.averageRating - first.averageRating;
      if (artistSort === "popularity") {
        return (second.youtubeSubscribers + second.spotifyMonthlyListeners) - (first.youtubeSubscribers + first.spotifyMonthlyListeners);
      }
      return second.averageRating - first.averageRating || second.ratingCount - first.ratingCount;
    }), [artists, minimumRatings, artistSort]);

  return (
    <main className="page rankings-page">
      <section className="page-heading">
        <p className="eyebrow">Community charts</p>
        <h1>OTO rankings</h1>
        <p>Scores are calculated from public aggregate ratings. A song needs at least {minimumRatings} rating{minimumRatings === 1 ? "" : "s"} to appear.</p>
      </section>

      <section className="ranking-controls" aria-label="Ranking controls">
        <div className="tab-list" role="tablist" aria-label="Ranking type">
          <button className={tab === "songs" ? "active" : ""} onClick={() => setTab("songs")} role="tab" aria-selected={tab === "songs"}>Songs</button>
          <button className={tab === "artists" ? "active" : ""} onClick={() => setTab("artists")} role="tab" aria-selected={tab === "artists"}>Artists</button>
        </div>
        <label>
          Minimum ratings
          <select value={minimumRatings} onChange={(event) => setMinimumRatings(Number(event.target.value))}>
            <option value={1}>1 rating</option>
            <option value={3}>3 ratings</option>
            <option value={5}>5 ratings</option>
            <option value={10}>10 ratings</option>
          </select>
        </label>
        {tab === "songs" ? <label>
          Sort songs by
          <select value={songSort} onChange={(event) => setSongSort(event.target.value as SongSort)}>
            <option value="rating">Highest score</option>
            <option value="votes">Most ratings</option>
          </select>
        </label> : <label>
          Sort artists by
          <select value={artistSort} onChange={(event) => setArtistSort(event.target.value as ArtistSort)}>
            <option value="rating">Highest score</option>
            <option value="favourites">Most favourites</option>
            <option value="popularity">Sample audience</option>
          </select>
        </label>}
      </section>

      {loading ? <p className="empty-state">Loading rankings…</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}
      {!loading && !error && tab === "songs" ? <ol className="ranking-list">
        {rankedSongs.map((song, index) => <li className="ranking-row" key={song.songId}>
          <span className="ranking-position">{index + 1}</span>
          <div className="ranking-copy">
            <Link href={`/artists/${song.artistId}`}>{song.title}</Link>
            <span>{song.titleJapanese ? `${song.titleJapanese} · ` : ""}{song.artistName} · {song.releaseYear}</span>
          </div>
          <div className="ranking-score"><strong>{song.averageRating.toFixed(1)}</strong><span>/ 10 · {song.ratingCount} ratings</span></div>
        </li>)}
        {rankedSongs.length === 0 ? <li className="empty-state">No songs meet this minimum yet. Add ratings from an artist page.</li> : null}
      </ol> : null}
      {!loading && !error && tab === "artists" ? <ol className="ranking-list">
        {rankedArtists.map((artist, index) => <li className="ranking-row" key={artist.artistId}>
          <span className="ranking-position">{index + 1}</span>
          <div className="ranking-copy">
            <Link href={`/artists/${artist.artistId}`}>{artist.artistName}</Link>
            <span>{artist.artistNameJapanese} · {artist.favouriteCount} favourites · {formatAudience(artist.youtubeSubscribers)} YouTube / {formatAudience(artist.spotifyMonthlyListeners)} Spotify sample</span>
          </div>
          <div className="ranking-score"><strong>{artist.averageRating.toFixed(1)}</strong><span>/ 10 · {artist.ratingCount} ratings</span></div>
        </li>)}
        {rankedArtists.length === 0 ? <li className="empty-state">No artists meet this minimum yet. Add ratings from an artist page.</li> : null}
      </ol> : null}
    </main>
  );
}
