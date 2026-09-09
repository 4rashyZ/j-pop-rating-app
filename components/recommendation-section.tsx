"use client";

import { useEffect, useMemo, useState } from "react";
import { getArtistRecommendations, type ArtistRecommendation } from "@/lib/recommendations";
import { fetchSongRankings, type SongRanking } from "@/lib/rankings";
import type { Artist } from "@/lib/data";
import { useApp } from "./app-provider";
import { ArtistCard } from "./artist-card";

export function RecommendationSection({ artists }: { artists: Artist[] }) {
  const { user, favourites, ratings } = useApp();
  const [songs, setSongs] = useState<SongRanking[]>([]);

  useEffect(() => {
    if (!user) return;
    void fetchSongRankings().then(setSongs).catch(() => setSongs([]));
  }, [user]);

  const recommendations = useMemo<ArtistRecommendation[]>(() => {
    if (!user || artists.length === 0) return [];
    return getArtistRecommendations({ artists, songs, favouriteArtistIds: favourites, ratings });
  }, [artists, favourites, ratings, songs, user]);

  if (!user || recommendations.length === 0) return null;

  return <section className="recommendation-section" aria-labelledby="recommendations-heading">
    <div className="section-heading">
      <div><span className="eyebrow">MADE FOR YOUR ROTATION</span><h2 id="recommendations-heading">Recommended for you</h2></div>
      <span className="song-count">Private to your account</span>
    </div>
    <div className="artist-grid recommendation-grid">
      {recommendations.map(({ artist, reason }) => <ArtistCard artist={artist} note={reason} key={artist.id} />)}
    </div>
    <p className="recommendation-note">Suggestions use only your saved favourites and ratings, alongside the public catalogue&apos;s genres.</p>
  </section>;
}
