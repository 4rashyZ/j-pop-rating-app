"use client";

import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { HeartIcon } from "@/components/icons";
import { useApp } from "@/components/app-provider";
import { artists } from "@/lib/data";

export default function FavouritesPage() {
  const { favourites, hydrated } = useApp();
  const favouriteArtists = artists.filter((artist) => favourites.includes(artist.id));

  return (
    <div className="page-wrap favourites-page">
      <header className="page-header">
        <span className="eyebrow">YOUR COLLECTION</span>
        <h1>Favourite artists</h1>
        <p>The voices and sounds you always come back to.</p>
      </header>
      {hydrated && favouriteArtists.length === 0 ? (
        <div className="empty-state large"><span className="empty-icon"><HeartIcon size={34} /></span><h2>Your favourites are waiting</h2><p>Tap the heart on an artist to add them to your collection.</p><Link href="/" className="primary-button">Discover artists</Link></div>
      ) : (
        <div className="artist-grid">{favouriteArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div>
      )}
    </div>
  );
}
