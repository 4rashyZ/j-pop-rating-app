"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { createClient } from "@/lib/supabase/client";

type SongResult = { id: string; title: string; titleJapanese: string | null; release: string; year: number; artistId: string; artistName: string };

export default function AdminSongsPage() {
  const { user, profile, hydrated, configured } = useApp();
  const [songs, setSongs] = useState<SongResult[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.role !== "admin") return;
    const timer = window.setTimeout(() => {
      void createClient().from("songs").select("id, title, title_japanese, release_name, release_year, artist_id, artists!inner(name)").order("title").then(({ data, error: loadError }) => {
        if (loadError) { setError(loadError.message); return; }
        setSongs(((data ?? []) as unknown as Array<{ id: string; title: string; title_japanese: string | null; release_name: string; release_year: number; artist_id: string; artists: { name: string } }>).map((song) => ({ id: song.id, title: song.title, titleJapanese: song.title_japanese, release: song.release_name, year: song.release_year, artistId: song.artist_id, artistName: song.artists.name })));
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [profile?.role]);

  const filteredSongs = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return songs;
    return songs.filter((song) => [song.title, song.titleJapanese ?? "", song.release, song.artistName].some((value) => value.toLocaleLowerCase().includes(search)));
  }, [songs, query]);

  if (!configured) return <main className="page"><p className="empty-state">Configure Supabase before using administration.</p></main>;
  if (!hydrated) return <main className="page"><p className="empty-state">Loading…</p></main>;
  if (!user || profile?.role !== "admin") return <main className="page"><section className="empty-state"><h1>Admin access required</h1><p>This page is available only to administrator accounts.</p></section></main>;

  return <main className="page admin-catalogue-page">
    <section className="page-heading"><p className="eyebrow">Admin catalogue</p><h1>Find a song</h1><p>Search by song title, Japanese title, release, or artist, then open the record directly in the editor.</p></section>
    <nav className="admin-subnav" aria-label="Catalogue sections"><Link href="/admin/artists">Artists</Link><Link className="active" href="/admin/songs">Songs</Link><Link href="/admin">Editor</Link></nav>
    <label className="catalogue-search"><span>Search songs</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Idol, First Love, or YOASOBI…" type="search" /></label>
    {error ? <p className="form-message error">{error}</p> : null}
    <div className="catalogue-results" aria-live="polite"><p className="result-count">{filteredSongs.length} song{filteredSongs.length === 1 ? "" : "s"}</p>{filteredSongs.map((song) => <article className="catalogue-result" key={song.id}><div><Link href={`/artists/${song.artistId}`} className="catalogue-result-title">{song.title}</Link><p>{song.titleJapanese ? `${song.titleJapanese} · ` : ""}{song.artistName} · {song.release} ({song.year})</p></div><Link className="secondary-button" href={`/admin?song=${encodeURIComponent(song.id)}`}>Edit song</Link></article>)}{filteredSongs.length === 0 ? <p className="empty-state">No songs match “{query}”. Try a different title or artist.</p> : null}</div>
  </main>;
}
