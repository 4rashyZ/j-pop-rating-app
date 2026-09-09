"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SearchIcon, StarIcon } from "@/components/icons";
import { Pagination } from "@/components/pagination";
import { fetchSongCatalogue, formatDuration, type SongCatalogueItem } from "@/lib/songs";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SongsPage() {
  const songsPerPage = 10;
  const [songs, setSongs] = useState<SongCatalogueItem[]>([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [minimumScore, setMinimumScore] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void fetchSongCatalogue().then(setSongs).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load songs."));
  }, []);

  const genres = useMemo(() => ["All", ...new Set(songs.flatMap((song) => song.genres))], [songs]);
  const years = useMemo(() => ["All", ...new Set(songs.map((song) => String(song.releaseYear)).sort().reverse())], [songs]);
  const matchingSongs = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return songs.filter((song) => {
      const matchesText = !search || [song.title, song.titleJapanese ?? "", song.artistName, song.releaseName].some((value) => value.toLocaleLowerCase().includes(search));
      return matchesText && (genre === "All" || song.genres.includes(genre)) && (year === "All" || String(song.releaseYear) === year) && song.averageRating >= minimumScore;
    }).sort((first, second) => second.averageRating - first.averageRating || first.title.localeCompare(second.title));
  }, [songs, query, genre, year, minimumScore]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(matchingSongs.length / songsPerPage)));
  const filteredSongs = useMemo(() => matchingSongs.slice((currentPage - 1) * songsPerPage, currentPage * songsPerPage), [matchingSongs, currentPage]);

  return <main className="page songs-catalogue-page">
    <section className="page-heading"><p className="eyebrow">Explore every track</p><h1>Song catalogue</h1><p>Search the full OTO catalogue by title, artist, release, genre, year, or community score.</p></section>
    <section className="public-song-filters" aria-label="Song filters">
      <label className="catalogue-search"><span>Search songs</span><span className="search-input"><SearchIcon /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs, artists, or releases…" /></span></label>
      <label>Genre<select value={genre} onChange={(event) => setGenre(event.target.value)}>{genres.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      <label>Release year<select value={year} onChange={(event) => setYear(event.target.value)}>{years.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      <label>Minimum score<select value={minimumScore} onChange={(event) => setMinimumScore(Number(event.target.value))}><option value={0}>Any score</option><option value={6}>6+</option><option value={7}>7+</option><option value={8}>8+</option><option value={9}>9+</option></select></label>
    </section>
    {!isSupabaseConfigured ? <p className="empty-state">Configure Supabase to load the song catalogue.</p> : error ? <p className="form-message error">{error}</p> : <section className="public-song-results" aria-live="polite"><p className="result-count">{filteredSongs.length} song{filteredSongs.length === 1 ? "" : "s"}</p>{filteredSongs.map((song) => <article className="public-song-card" key={song.songId}><div className="song-card-score"><StarIcon filled={song.ratingCount > 0} /><strong>{song.ratingCount ? song.averageRating.toFixed(1) : "—"}</strong><span>{song.ratingCount} rating{song.ratingCount === 1 ? "" : "s"}</span></div><div className="ranking-copy"><Link href={`/songs/${song.songId}`}>{song.title}</Link><span>{song.titleJapanese ? `${song.titleJapanese} · ` : ""}{song.artistName} · {song.releaseName} · {song.releaseYear}</span><div className="tag-row">{song.genres.map((item) => <span key={item}>{item}</span>)}</div></div><span className="duration">{formatDuration(song.durationSeconds)}</span><Link className="secondary-button" href={`/songs/${song.songId}`}>View song</Link></article>)}{filteredSongs.length === 0 ? <p className="empty-state">No songs match these filters. Try broadening your search.</p> : null}</section>}
    <Pagination currentPage={currentPage} totalItems={matchingSongs.length} pageSize={songsPerPage} itemLabel="songs" onPageChange={setPage} />
  </main>;
}
