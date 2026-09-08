import type { Artist } from "@/lib/data";

export function ArtistVisual({ artist, className = "" }: { artist: Artist; className?: string }) {
  return (
    <div className={`artist-visual ${className}`} style={{ "--accent": artist.accent, "--accent-soft": artist.accentSoft } as React.CSSProperties}>
      <span className="visual-orbit orbit-one" />
      <span className="visual-orbit orbit-two" />
      <span className="visual-initials">{artist.initials}</span>
      <span className="visual-japanese">{artist.nameJapanese}</span>
    </div>
  );
}
