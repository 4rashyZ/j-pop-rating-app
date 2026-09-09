"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Artist } from "@/lib/data";
import { useApp } from "./app-provider";
import { ArtistVisual } from "./artist-visual";
import { HeartIcon } from "./icons";

export function ArtistCard({ artist }: { artist: Artist }) {
  const router = useRouter();
  const { favourites, toggleFavourite, user } = useApp();
  const favourite = favourites.includes(artist.id);

  const handleFavourite = async () => {
    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(`/artists/${artist.id}`)}`);
      return;
    }
    try {
      await toggleFavourite(artist.id);
    } catch {
      window.alert("Your favourite could not be updated. Please try again.");
    }
  };

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
        <button className={`heart-button ${favourite ? "selected" : ""}`} onClick={handleFavourite} aria-label={`${favourite ? "Remove" : "Add"} ${artist.name} ${favourite ? "from" : "to"} favourites`}><HeartIcon filled={favourite} size={19} /></button>
      </div>
    </article>
  );
}
