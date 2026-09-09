"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { Pagination } from "@/components/pagination";
import { RecommendationSection } from "@/components/recommendation-section";
import { SearchIcon } from "@/components/icons";
import { fetchArtists } from "@/lib/catalog";
import type { Artist } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function Home() {
  const artistsPerPage = 6;
  const [artists, setArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void fetchArtists().then(setArtists).catch(() => setError("The artist catalogue could not be loaded. Check your Supabase setup and migration."));
  }, []);
  const genres = useMemo(() => ["All", ...Array.from(new Set(artists.flatMap((artist) => artist.genres)))], [artists]);
  const matchingArtists = useMemo(() => artists.filter((artist) => {
    const matchesGenre = genre === "All" || artist.genres.includes(genre);
    const query = search.trim().toLowerCase();
    return matchesGenre && (!query || `${artist.name} ${artist.nameJapanese} ${artist.genres.join(" ")}`.toLowerCase().includes(query));
  }), [artists, genre, search]);
  const filteredArtists = useMemo(() => matchingArtists.slice((page - 1) * artistsPerPage, page * artistsPerPage), [matchingArtists, page]);

  return <div className="page-wrap home-page">
    <section className="hero"><div className="hero-glow" /><div className="hero-copy"><span className="eyebrow">DISCOVER JAPAN&apos;S SOUND</span><h1>Your next favourite<br /><em>starts here.</em></h1><p>Explore standout J-Pop artists, rate the songs on repeat, and keep your favourites close.</p></div><div className="hero-disc" aria-hidden="true"><span className="disc-ring ring-a" /><span className="disc-ring ring-b" /><span className="disc-label">OTO</span></div></section>
    <RecommendationSection artists={artists} />
    <section className="discover-section">
      <div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Artists to discover</h2></div><label className="search-box"><SearchIcon /><span className="sr-only">Search artists</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search artists" /></label></div>
      {isSupabaseConfigured && <div className="genre-row" aria-label="Filter by genre">{genres.map((item) => <button className={genre === item ? "genre-chip selected" : "genre-chip"} onClick={() => { setGenre(item); setPage(1); }} key={item}>{item}</button>)}</div>}
      {!isSupabaseConfigured ? <SetupNotice /> : error ? <div className="empty-state"><h3>Catalogue unavailable</h3><p>{error}</p></div> : filteredArtists.length > 0 ? <div className="artist-grid">{filteredArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div> : <div className="empty-state"><h3>{artists.length === 0 ? "Loading catalogue…" : "No artists found"}</h3><p>{artists.length === 0 ? "The database may still be seeding your Phase 2 data." : "Try another name or genre."}</p></div>}
    </section>
    <Pagination currentPage={page} totalItems={matchingArtists.length} pageSize={artistsPerPage} itemLabel="artists" onPageChange={setPage} />
    <p className="data-note">Popularity figures are manually maintained sample data for this prototype.</p>
  </div>;
}

function SetupNotice() {
  return <div className="empty-state setup-notice"><h3>Connect your Supabase project</h3><p>Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, then run the SQL migration in the Supabase dashboard.</p></div>;
}
