"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistVisual } from "@/components/artist-visual";
import { ReviewSection } from "@/components/review-section";
import { SongList } from "@/components/song-list";
import type { RatingSummary } from "@/lib/catalog";
import type { Song } from "@/lib/data";
import { fetchSongDetails, formatDuration, type SongDetails } from "@/lib/songs";

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<SongDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchSongDetails(id).then(setDetails).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load this song.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="page"><p className="empty-state">Loading song…</p></main>;
  if (error || !details) return <main className="page"><section className="empty-state"><h1>Song unavailable</h1><p>{error || "This song is not in the catalogue."}</p><Link className="primary-button" href="/songs">Browse songs</Link></section></main>;

  const song: Song = { id: details.songId, artistId: details.artistId, title: details.title, titleJapanese: details.titleJapanese, release: details.releaseName, year: details.releaseYear, duration: formatDuration(details.durationSeconds) };
  const summaries = new Map<string, RatingSummary>([[details.songId, { songId: details.songId, averageRating: details.averageRating, ratingCount: details.ratingCount }]]);
  return <main className="song-detail-page">
    <section className="song-detail-hero" style={{ "--page-accent": details.artist.accent, "--page-accent-soft": details.artist.accentSoft } as React.CSSProperties}><ArtistVisual artist={details.artist} className="song-detail-art" /><div><p className="eyebrow">Song · {details.releaseYear}</p><h1>{details.title}</h1>{details.titleJapanese ? <p className="japanese-name">{details.titleJapanese}</p> : null}<p>By <Link href={`/artists/${details.artistId}`}>{details.artistName}</Link> · {details.releaseName}</p><div className="tag-row">{details.genres.map((genre) => <span key={genre}>{genre}</span>)}</div></div></section>
    <div className="song-detail-body"><section><div className="section-heading"><div><p className="eyebrow">Your score</p><h2>Rate this song</h2></div></div><SongList songs={[song]} accent={details.artist.accent} summaries={summaries} /></section><ReviewSection songId={details.songId} /></div>
  </main>;
}
