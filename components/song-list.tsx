"use client";

import type { Song } from "@/lib/data";
import { useApp } from "./app-provider";
import { PlayIcon, StarIcon } from "./icons";

export function SongList({ songs, accent }: { songs: Song[]; accent: string }) {
  const { ratings, setRating } = useApp();

  return (
    <div className="song-list">
      {songs.map((song, index) => {
        const rating = ratings[song.id];
        return (
          <article className="song-row" key={song.id} style={{ "--song-accent": accent } as React.CSSProperties}>
            <div className="song-number"><span>{index + 1}</span><span className="row-play"><PlayIcon size={16} /></span></div>
            <div className="song-copy">
              <h3>{song.title}</h3>
              <p>{song.titleJapanese ? `${song.titleJapanese} · ` : ""}{song.release} · {song.year}</p>
            </div>
            <span className="duration">{song.duration}</span>
            <div className="rating-control">
              <label htmlFor={`rating-${song.id}`}><StarIcon filled={Boolean(rating)} /><span>{rating ? `${rating}/10` : "Rate"}</span></label>
              <select id={`rating-${song.id}`} value={rating ?? ""} onChange={(event) => setRating(song.id, Number(event.target.value))} aria-label={`Rate ${song.title}`}>
                <option value="" disabled>Rate</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => <option value={value} key={value}>{value}/10</option>)}
              </select>
            </div>
          </article>
        );
      })}
    </div>
  );
}
