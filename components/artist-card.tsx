"use client";

import Link from "next/link";
import type { Artist } from "@/lib/data";
import { useApp } from "./app-provider";
import { ArtistVisual } from "./artist-visual";
import { HeartIcon } from "./icons";

export function ArtistCard({ artist }: { artist: Artist }) {
  const { favourites, toggleFavourite } = useApp();
  const favourite = favourites.includes(artist.id);

  return (
    <article className="artist-card">
      <Link href={`/artists/${artist.id}`} className="artist-card-link" aria-label={`View ${artist.name}`}>
        <ArtistVisual artist={artist} />
      </Link>
      <div className="artist-card-info">
        <div>
          <Link href={`/artists/${artist.id}`} className="artist-name">{artist.name}</Link>
          <p>{artist.genres.join(" · ")}</p>
        </div>
        <button className={`heart-button ${favourite ? "selected" : ""}`} onClick={() => toggleFavourite(artist.id)} aria-label={`${favourite ? "Remove" : "Add"} ${artist.name} ${favourite ? "from" : "to"} favourites`}><HeartIcon filled={favourite} size={19} /></button>
      </div>
    </article>
  );
}
