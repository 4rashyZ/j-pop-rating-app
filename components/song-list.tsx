"use client";

import type { Song } from "@/lib/data";
import type { RatingSummary } from "@/lib/catalog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-provider";
import { PlayIcon, StarIcon } from "./icons";

export function SongList({ songs, accent, summaries }: { songs: Song[]; accent: string; summaries: Map<string, RatingSummary> }) {
  const router = useRouter();
  const { ratings, setRating, user } = useApp();
  const [ratingOpen, setRatingOpen] = useState<string | null>(null);

  const rateSong = async (song: Song, rating: number) => {
    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      await setRating(song.id, rating);
      setRatingOpen(null);
    } catch {
      window.alert("Your rating could not be saved. Please try again.");
    }
  };

  return (
    <div className="song-list">
      {songs.map((song, index) => {
        const rating = ratings[song.id];
        const summary = summaries.get(song.id);
        return (
          <article className="song-row" key={song.id} style={{ "--song-accent": accent } as React.CSSProperties}>
            <div className="song-number"><span>{index + 1}</span><span className="row-play"><PlayIcon size={16} /></span></div>
            <Link className="song-copy" href={`/songs/${song.id}`} aria-label={`Open ${song.title}`}>
              <h3>{song.title}</h3>
              <p>{song.titleJapanese ? `${song.titleJapanese} · ` : ""}{song.release} · {song.year}{summary ? ` · ${summary.averageRating.toFixed(1)}/10 (${summary.ratingCount})` : " · Not rated yet"}</p>
            </Link>
            <span className="duration">{song.duration}</span>
            <div className="rating-control">
              <button className="rating-trigger" type="button" aria-haspopup="listbox" aria-expanded={ratingOpen === song.id} aria-label={`Rate ${song.title}`} onClick={() => setRatingOpen((current) => current === song.id ? null : song.id)}><StarIcon filled={Boolean(rating)} /><span>{rating ? `${rating}/10` : "Rate"}</span></button>
              {ratingOpen === song.id ? <div className="rating-menu" role="listbox" aria-label={`Choose a rating for ${song.title}`} onKeyDown={(event) => { if (event.key === "Escape") setRatingOpen(null); }}>{Array.from({ length: 10 }, (_, i) => i + 1).map((value) => <button type="button" role="option" aria-selected={rating === value} className={rating === value ? "selected" : ""} onClick={() => void rateSong(song, value)} key={value}>{value}/10</button>)}</div> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
