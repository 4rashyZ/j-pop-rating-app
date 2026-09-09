"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { createClient } from "@/lib/supabase/client";

type RatingHistoryItem = {
  songId: string;
  rating: number;
  updatedAt: string;
  title: string;
  artistId: string;
  artistName: string;
};

export default function ProfilePage() {
  const { user, profile, configured, hydrated, updateProfile, favourites } = useApp();
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);
  const [ratings, setRatings] = useState<RatingHistoryItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadRatings = async () => {
      const { data, error: ratingsError } = await createClient()
        .from("ratings")
        .select("song_id, rating, updated_at, songs!inner(title, artist_id, artists!inner(name))")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (ratingsError) {
        setError(ratingsError.message);
        return;
      }
      const rows = (data ?? []) as unknown as Array<{
        song_id: string;
        rating: number;
        updated_at: string;
        songs: { title: string; artist_id: string; artists: { name: string } };
      }>;
      setRatings(rows.map((row) => ({
        songId: row.song_id,
        rating: row.rating,
        updatedAt: row.updated_at,
        title: row.songs.title,
        artistId: row.songs.artist_id,
        artistName: row.songs.artists.name,
      })));
    };
    void loadRatings();
  }, [user]);

  const statistics = useMemo(() => {
    const averageRating = ratings.length ? ratings.reduce((total, item) => total + item.rating, 0) / ratings.length : 0;
    const highRatings = ratings.filter((item) => item.rating >= 8).length;
    const artistCounts = new Map<string, { name: string; count: number }>();
    ratings.forEach((item) => {
      const current = artistCounts.get(item.artistId);
      artistCounts.set(item.artistId, { name: item.artistName, count: (current?.count ?? 0) + 1 });
    });
    const topArtist = [...artistCounts.values()].sort((first, second) => second.count - first.count || first.name.localeCompare(second.name))[0] ?? null;
    return { averageRating, highRatings, topArtist };
  }, [ratings]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(displayNameDraft ?? profile?.displayName ?? "");
      setMessage("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!configured) return <main className="page"><p className="empty-state">Add your Supabase values to <code>.env.local</code> to use profiles.</p></main>;
  if (!hydrated) return <main className="page"><p className="empty-state">Loading your profile…</p></main>;
  if (!user) return <main className="page"><section className="empty-state"><h1>Your profile</h1><p>Sign in to update your account and revisit your ratings.</p><Link className="primary-button" href="/auth?next=/profile">Sign in</Link></section></main>;

  return <main className="page profile-page">
    <section className="page-heading">
      <p className="eyebrow">Your account</p>
      <h1>{profile?.displayName ?? "OTO listener"}</h1>
      <p>{user.email} · Your ratings and favourites are visible only to you.</p>
    </section>
    <section className="profile-statistics" aria-label="Your listening statistics">
      <article className="profile-stat"><span>Song ratings</span><strong>{ratings.length}</strong><small>saved scores</small></article>
      <article className="profile-stat"><span>Average score</span><strong>{ratings.length ? statistics.averageRating.toFixed(1) : "—"}</strong><small>out of 10</small></article>
      <article className="profile-stat"><span>High scores</span><strong>{statistics.highRatings}</strong><small>ratings of 8 or higher</small></article>
      <article className="profile-stat"><span>Favourite artists</span><strong>{favourites.length}</strong><small>{statistics.topArtist ? `Most rated: ${statistics.topArtist.name}` : "start building your library"}</small></article>
    </section>
    <section className="profile-grid">
      <form className="profile-card" onSubmit={saveProfile}>
        <h2>Profile details</h2>
        <p>Use the account menu in the top-right corner to change your profile picture.</p>
        <label>
          Display name
          <input value={displayNameDraft ?? profile?.displayName ?? ""} maxLength={60} onChange={(event) => setDisplayNameDraft(event.target.value)} required />
        </label>
        <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
        {message ? <p className="form-message success">{message}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}
      </form>
      <section className="profile-card">
        <h2>Your library</h2>
        <p>{statistics.topArtist ? `${statistics.topArtist.name} is currently your most-rated artist.` : "Rate a few songs to reveal your listening patterns."}</p>
        <Link className="text-link" href="/favourites">Open favourite artists →</Link>
      </section>
    </section>
    <section className="profile-history">
      <div className="section-heading"><div><p className="eyebrow">Private history</p><h2>Your song ratings</h2></div></div>
      {ratings.length ? <ol className="ranking-list">
        {ratings.map((item) => <li className="ranking-row" key={item.songId}>
          <span className="rating-badge">{item.rating}</span>
          <div className="ranking-copy"><Link href={`/artists/${item.artistId}`}>{item.title}</Link><span>{item.artistName} · updated {new Date(item.updatedAt).toLocaleDateString()}</span></div>
          <Link className="text-link" href={`/artists/${item.artistId}`}>Edit rating</Link>
        </li>)}
      </ol> : <p className="empty-state">You have not rated a song yet. Explore an artist to give a song a score.</p>}
    </section>
  </main>;
}
