"use client";

import { useMemo, useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { SearchIcon } from "@/components/icons";
import { artists, genres } from "@/lib/data";

export default function Home() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");

  const filteredArtists = useMemo(() => artists.filter((artist) => {
    const matchesGenre = genre === "All" || artist.genres.includes(genre);
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${artist.name} ${artist.nameJapanese} ${artist.genres.join(" ")}`.toLowerCase().includes(query);
    return matchesGenre && matchesSearch;
  }), [genre, search]);

  return (
    <div className="page-wrap">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-copy">
          <span className="eyebrow">DISCOVER JAPAN&apos;S SOUND</span>
          <h1>Your next favourite<br /><em>starts here.</em></h1>
          <p>Explore standout J-Pop artists, rate the songs on repeat, and keep your favourites close.</p>
        </div>
        <div className="hero-disc" aria-hidden="true">
          <span className="disc-ring ring-a" /><span className="disc-ring ring-b" /><span className="disc-label">OTO</span>
        </div>
      </section>

      <section className="discover-section">
        <div className="section-heading">
          <div><span className="eyebrow">CURATED FOR YOU</span><h2>Artists to discover</h2></div>
          <label className="search-box"><SearchIcon /><span className="sr-only">Search artists</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search artists" /></label>
        </div>
        <div className="genre-row" aria-label="Filter by genre">
          {genres.map((item) => <button className={genre === item ? "genre-chip selected" : "genre-chip"} onClick={() => setGenre(item)} key={item}>{item}</button>)}
        </div>
        {filteredArtists.length > 0 ? (
          <div className="artist-grid">{filteredArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div>
        ) : (
          <div className="empty-state"><h3>No artists found</h3><p>Try another name or genre.</p></div>
        )}
      </section>
      <p className="data-note">Popularity figures are sample data for this prototype.</p>
    </div>
  );
}
