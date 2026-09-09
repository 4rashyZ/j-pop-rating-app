"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { fetchArtists } from "@/lib/catalog";
import type { Artist } from "@/lib/data";

export default function AdminArtistsPage() {
  const { user, profile, hydrated, configured } = useApp();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.role !== "admin") return;
    const timer = window.setTimeout(() => {
      void fetchArtists().then(setArtists).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load artists."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [profile?.role]);

  const filteredArtists = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return artists;
    return artists.filter((artist) => [artist.name, artist.nameJapanese, ...artist.genres].some((value) => value.toLocaleLowerCase().includes(search)));
  }, [artists, query]);

  if (!configured) return <main className="page"><p className="empty-state">Configure Supabase before using administration.</p></main>;
  if (!hydrated) return <main className="page"><p className="empty-state">Loading…</p></main>;
  if (!user || profile?.role !== "admin") return <main className="page"><section className="empty-state"><h1>Admin access required</h1><p>This page is available only to administrator accounts.</p></section></main>;

  return <main className="page admin-catalogue-page">
    <section className="page-heading"><p className="eyebrow">Admin catalogue</p><h1>Find an artist</h1><p>Search by artist name, Japanese name, or genre, then open the record directly in the editor.</p></section>
    <nav className="admin-subnav" aria-label="Catalogue sections"><Link className="active" href="/admin/artists">Artists</Link><Link href="/admin/songs">Songs</Link><Link href="/admin">Editor</Link></nav>
    <label className="catalogue-search"><span>Search artists</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try YOASOBI, ヨアソビ, or Rock…" type="search" /></label>
    {error ? <p className="form-message error">{error}</p> : null}
    <div className="catalogue-results" aria-live="polite"><p className="result-count">{filteredArtists.length} artist{filteredArtists.length === 1 ? "" : "s"}</p>{filteredArtists.map((artist) => <article className="catalogue-result" key={artist.id}><div><Link href={`/artists/${artist.id}`} className="catalogue-result-title">{artist.name}</Link><p>{artist.nameJapanese} · {artist.genres.join(" · ")}</p></div><Link className="secondary-button" href={`/admin?artist=${encodeURIComponent(artist.id)}`}>Edit artist</Link></article>)}{filteredArtists.length === 0 ? <p className="empty-state">No artists match “{query}”. Try a different name or genre.</p> : null}</div>
  </main>;
}
