"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArtistCard } from "@/components/artist-card";
import { HeartIcon } from "@/components/icons";
import { useApp } from "@/components/app-provider";
import { fetchArtists } from "@/lib/catalog";
import type { Artist } from "@/lib/data";

export default function FavouritesPage() {
  const { favourites, hydrated, user, configured } = useApp();
  const [artists, setArtists] = useState<Artist[]>([]);
  useEffect(() => { if (configured) void fetchArtists().then(setArtists).catch(() => setArtists([])); }, [configured]);
  const favouriteArtists = artists.filter((artist) => favourites.includes(artist.id));
  return <div className="page-wrap favourites-page"><header className="page-header"><span className="eyebrow">YOUR COLLECTION</span><h1>Favourite artists</h1><p>The voices and sounds you always come back to.</p></header>{!configured ? <div className="empty-state large"><h2>Supabase setup required</h2><p>Connect the project before using cloud favourites.</p></div> : !hydrated ? <div className="empty-state large"><h2>Loading your collection…</h2></div> : !user ? <div className="empty-state large"><span className="empty-icon"><HeartIcon size={34} /></span><h2>Sign in to keep favourites</h2><p>Your collection is stored securely in your account.</p><Link href="/auth?next=/favourites" className="primary-button">Sign in</Link></div> : favouriteArtists.length === 0 ? <div className="empty-state large"><span className="empty-icon"><HeartIcon size={34} /></span><h2>Your favourites are waiting</h2><p>Tap the heart on an artist to add them to your collection.</p><Link href="/" className="primary-button">Discover artists</Link></div> : <div className="artist-grid">{favouriteArtists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}</div>}</div>;
}
