/* Artist image URLs are dynamic and may be externally hosted with attribution. */
/* eslint-disable @next/next/no-img-element */

import type { Artist } from "@/lib/data";

export function ArtistVisual({ artist, className = "" }: { artist: Artist; className?: string }) {
  return (
    <div className={`artist-visual ${className}`} style={{ "--accent": artist.accent, "--accent-soft": artist.accentSoft } as React.CSSProperties}>
      {artist.imageUrl && <img className="artist-photo" src={artist.imageUrl} alt={`Portrait of ${artist.name}`} />}
      {!artist.imageUrl && <><span className="visual-orbit orbit-one" /><span className="visual-orbit orbit-two" /></>}
      <span className="visual-initials">{artist.initials}</span>
      <span className="visual-japanese">{artist.nameJapanese}</span>
    </div>
  );
}
