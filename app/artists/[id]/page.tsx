"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArtistVisual } from "@/components/artist-visual";
import { useApp } from "@/components/app-provider";
import { HeartIcon, PlayIcon } from "@/components/icons";
import { SongList } from "@/components/song-list";
import { getArtist } from "@/lib/data";

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const artist = getArtist(params.id);
  const { favourites, toggleFavourite } = useApp();

  if (!artist) {
    return <div className="page-wrap"><div className="empty-state artist-missing"><h1>Artist not found</h1><p>This artist is not in our collection yet.</p><Link href="/" className="primary-button">Back to discover</Link></div></div>;
  }

  const favourite = favourites.includes(artist.id);
  return (
    <div className="artist-page" style={{ "--page-accent": artist.accent, "--page-accent-soft": artist.accentSoft } as React.CSSProperties}>
      <section className="artist-hero">
        <div className="artist-hero-backdrop" />
        <ArtistVisual artist={artist} className="artist-portrait" />
        <div className="artist-hero-copy">
          <span className="verified">● FEATURED ARTIST</span>
          <h1>{artist.name}</h1>
          <p className="japanese-name">{artist.nameJapanese}</p>
          <p className="artist-bio">{artist.bio}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#songs"><PlayIcon /> View top songs</a>
            <button className={`secondary-button ${favourite ? "selected" : ""}`} onClick={() => toggleFavourite(artist.id)}><HeartIcon filled={favourite} />{favourite ? "Favourited" : "Favourite"}</button>
          </div>
        </div>
      </section>

      <div className="artist-body">
        <section className="stats-panel" aria-label="Artist statistics">
          <div><span>YouTube subscribers</span><strong>{artist.youtube}</strong><small>Sample metric</small></div>
          <div><span>Spotify listeners</span><strong>{artist.spotify}</strong><small>Sample metric</small></div>
          <div><span>Debut</span><strong>{artist.debut}</strong><small>{new Date().getFullYear() - artist.debut}+ years</small></div>
        </section>

        <section className="songs-section" id="songs">
          <div className="section-heading"><div><span className="eyebrow">YOUR SCORE, YOUR LIST</span><h2>Popular songs</h2></div><span className="song-count">{artist.songs.length} tracks</span></div>
          <SongList songs={artist.songs} accent={artist.accent} />
        </section>

        <section className="about-section">
          <span className="eyebrow">ARTIST PROFILE</span><h2>About {artist.name}</h2>
          <p>{artist.bio} This prototype profile can later grow to include albums, official links, group members, and live popularity history.</p>
          <div className="tag-row">{artist.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
        </section>
      </div>
    </div>
  );
}
