"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistVisual } from "@/components/artist-visual";
import { useApp } from "@/components/app-provider";
import { HeartIcon, PlayIcon } from "@/components/icons";
import { SongList } from "@/components/song-list";
import { fetchArtistWithSongs, fetchRatingSummaries, type RatingSummary } from "@/lib/catalog";
import { formatAudience, type ArtistWithSongs } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { favourites, toggleFavourite, user } = useApp();
  const [artistData, setArtistData] = useState<ArtistWithSongs | null>(null);
  const [summaries, setSummaries] = useState<Map<string, RatingSummary>>(new Map());
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const loadArtist = async () => {
      try {
        const data = await fetchArtistWithSongs(params.id);
        setArtistData(data);
        if (data) setSummaries(await fetchRatingSummaries(data.songs.map((song) => song.id)));
      } catch { setError("This artist could not be loaded from the database."); }
    };
    void loadArtist();
  }, [params.id]);
  if (!isSupabaseConfigured) return <div className="page-wrap"><div className="empty-state artist-missing"><h1>Supabase setup required</h1><p>Configure your environment variables and apply the Phase 2 migration first.</p><Link href="/" className="primary-button">Back to discover</Link></div></div>;
  if (error || artistData === null) return <div className="page-wrap"><div className="empty-state artist-missing"><h1>{error ? "Artist unavailable" : "Loading artist…"}</h1><p>{error || "Retrieving the portfolio and songs."}</p><Link href="/" className="primary-button">Back to discover</Link></div></div>;
  const { artist, songs } = artistData;
  const favourite = favourites.includes(artist.id);
  const handleFavourite = async () => {
    if (!user) { router.push(`/auth?next=${encodeURIComponent(`/artists/${artist.id}`)}`); return; }
    try { await toggleFavourite(artist.id); } catch { window.alert("Your favourite could not be updated. Please try again."); }
  };
  return <div className="artist-page" style={{ "--page-accent": artist.accent, "--page-accent-soft": artist.accentSoft } as React.CSSProperties}>
    <section className="artist-hero"><div className="artist-hero-backdrop" /><ArtistVisual artist={artist} className="artist-portrait" /><div className="artist-hero-copy"><span className="verified">● FEATURED ARTIST</span><h1>{artist.name}</h1><p className="japanese-name">{artist.nameJapanese}</p><p className="artist-bio">{artist.bio}</p><div className="hero-actions"><a className="primary-button" href="#songs"><PlayIcon /> View top songs</a><button className={`secondary-button ${favourite ? "selected" : ""}`} onClick={handleFavourite}><HeartIcon filled={favourite} />{favourite ? "Favourited" : "Favourite"}</button></div></div></section>
    <div className="artist-body"><section className="stats-panel" aria-label="Artist statistics"><div><span>YouTube subscribers</span><strong>{formatAudience(artist.youtube)}</strong><small>Manually maintained</small></div><div><span>Spotify listeners</span><strong>{formatAudience(artist.spotify)}</strong><small>Manually maintained</small></div><div><span>Debut</span><strong>{artist.debut}</strong><small>{new Date().getFullYear() - artist.debut}+ years</small></div></section><section className="songs-section" id="songs"><div className="section-heading"><div><span className="eyebrow">YOUR SCORE, YOUR LIST</span><h2>Popular songs</h2></div><span className="song-count">{songs.length} tracks</span></div><SongList songs={songs} accent={artist.accent} summaries={summaries} /></section><section className="about-section"><span className="eyebrow">ARTIST PROFILE</span><h2>About {artist.name}</h2><p>{artist.bio} This profile is sourced from the Phase 2 catalogue database.</p>{artist.imageCredit && artist.imageSourceUrl && <p className="image-credit">Photo: <a href={artist.imageSourceUrl} target="_blank" rel="noreferrer">{artist.imageCredit}</a></p>}<div className="tag-row">{artist.genres.map((genre) => <span key={genre}>{genre}</span>)}</div></section></div>
  </div>;
}
