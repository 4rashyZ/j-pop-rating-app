"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { fetchArtists } from "@/lib/catalog";
import type { Artist } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

type EditorTab = "artists" | "songs";
type SongOption = { id: string; title: string; artistId: string };
type FieldErrors = Record<string, string>;

const blankArtist = {
  id: "", name: "", nameJapanese: "", initials: "", bio: "", debut: "", youtube: "0", spotify: "0", genres: "J-Pop", imageCredit: "", imageSourceUrl: "",
};
const blankSong = { id: "", artistId: "", title: "", titleJapanese: "", release: "", year: "", duration: "180" };

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "An unknown error occurred.";
}

function databaseFieldErrors(message: string, isArtist: boolean): FieldErrors {
  const normalised = message.toLowerCase();
  if (normalised.includes("row-level security") || normalised.includes("permission denied") || normalised.includes("not authorized")) {
    return { _form: "Your account is not permitted to make this change. Confirm that you ran the Phase 3 migration, promoted this account to admin, then signed out and signed in again." };
  }
  if (normalised.includes("artists_pkey") || normalised.includes("songs_pkey") || normalised.includes("duplicate key") && normalised.includes("id")) {
    return { id: "This ID is already used. Choose a different URL-safe ID, or select the existing record above before updating it." };
  }
  if (normalised.includes("artists_name_key")) return { name: "An artist with this name already exists. Use a different name or edit the existing artist." };
  if (normalised.includes("foreign key") || normalised.includes("artist_id")) return { artistId: "Choose an artist that already exists before saving this song." };
  if (normalised.includes("initials")) return { initials: "Use between 1 and 3 characters for initials." };
  if (normalised.includes("debut_year") || normalised.includes("release_year")) return { [isArtist ? "debut" : "year"]: "Enter a year between 1900 and 2100." };
  if (normalised.includes("youtube_subscribers")) return { youtube: "Enter a whole number of zero or more." };
  if (normalised.includes("spotify_monthly_listeners")) return { spotify: "Enter a whole number of zero or more." };
  if (normalised.includes("duration_seconds")) return { duration: "Enter a duration from 1 to 3600 seconds." };
  if (normalised.includes("storage") || normalised.includes("bucket") || normalised.includes("upload")) return { imageFile: "The image could not be uploaded. Confirm the Phase 3 migration created the artist-images bucket and that the file is a PNG, JPG, WebP, or AVIF under 5 MB." };
  return { _form: `Supabase could not save this record: ${message}` };
}

export default function AdminPage() {
  const { user, profile, hydrated, configured } = useApp();
  const [tab, setTab] = useState<EditorTab>("artists");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<SongOption[]>([]);
  const [artistForm, setArtistForm] = useState(blankArtist);
  const [songForm, setSongForm] = useState(blankSong);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const clearFeedback = () => { setError(""); setMessage(""); setFieldErrors({}); };

  const loadCatalogue = async () => {
    const [artistRows, songResult] = await Promise.all([
      fetchArtists(),
      createClient().from("songs").select("id, title, artist_id").order("title"),
    ]);
    if (songResult.error) throw songResult.error;
    setArtists(artistRows);
    setSongs((songResult.data ?? []).map((song) => ({ id: song.id, title: song.title, artistId: song.artist_id })));
  };

  useEffect(() => {
    if (profile?.role !== "admin") return;
    const timer = window.setTimeout(() => {
      void loadCatalogue().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load the catalogue."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [profile?.role]);

  const selectArtist = (id: string) => {
    clearFeedback();
    const artist = artists.find((entry) => entry.id === id);
    if (!artist) {
      setArtistForm(blankArtist);
      setImageFile(null);
      return;
    }
    setArtistForm({
      id: artist.id, name: artist.name, nameJapanese: artist.nameJapanese, initials: artist.initials, bio: artist.bio,
      debut: String(artist.debut), youtube: String(artist.youtube), spotify: String(artist.spotify), genres: artist.genres.join(", "),
      imageCredit: artist.imageCredit ?? "", imageSourceUrl: artist.imageSourceUrl ?? "",
    });
    setImageFile(null);
  };

  const selectSong = (id: string) => {
    clearFeedback();
    const song = songs.find((entry) => entry.id === id);
    if (!song) {
      setSongForm(blankSong);
      return;
    }
    void (async () => {
      const { data, error: loadError } = await createClient().from("songs").select("id, artist_id, title, title_japanese, release_name, release_year, duration_seconds").eq("id", song.id).single();
      if (loadError) { setError(loadError.message); return; }
      setSongForm({ id: data.id, artistId: data.artist_id, title: data.title, titleJapanese: data.title_japanese ?? "", release: data.release_name, year: String(data.release_year), duration: String(data.duration_seconds) });
    })();
  };

  // The query-string selection should run when catalogue rows become available, not on every form update.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const artistId = params.get("artist");
      const songId = params.get("song");
      if (artistId && artists.length) { setTab("artists"); selectArtist(artistId); }
      if (songId && songs.length) { setTab("songs"); selectSong(songId); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [artists.length, songs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveArtist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); clearFeedback();
    const supabase = createClient();
    const id = artistForm.id.trim().toLowerCase();
    try {
      const validationErrors: FieldErrors = {};
      if (!/^[a-z0-9-]+$/.test(id)) validationErrors.id = "Use lowercase letters, numbers, and hyphens only, for example: bradio.";
      if (!artistForm.name.trim()) validationErrors.name = "Enter the artist's name.";
      if (!artistForm.nameJapanese.trim()) validationErrors.nameJapanese = "Enter a Japanese or display name.";
      if (!/^[a-z0-9]{1,3}$/i.test(artistForm.initials.trim())) validationErrors.initials = "Use 1–3 letters or numbers, for example: BR.";
      const debut = Number(artistForm.debut);
      if (!Number.isInteger(debut) || debut < 1900 || debut > 2100) validationErrors.debut = "Enter a whole year between 1900 and 2100.";
      const youtube = Number(artistForm.youtube);
      if (!Number.isInteger(youtube) || youtube < 0) validationErrors.youtube = "Enter a whole number of zero or more.";
      const spotify = Number(artistForm.spotify);
      if (!Number.isInteger(spotify) || spotify < 0) validationErrors.spotify = "Enter a whole number of zero or more.";
      const genreNames = [...new Set(artistForm.genres.split(",").map((name) => name.trim()).filter(Boolean))];
      if (genreNames.length === 0) validationErrors.genres = "Enter at least one genre, separated with commas when needed.";
      if (genreNames.some((name) => name.length > 50)) validationErrors.genres = "Each genre must be 50 characters or fewer.";
      if (!artistForm.bio.trim()) validationErrors.bio = "Enter a short artist biography.";
      if (imageFile && !["image/png", "image/jpeg", "image/webp", "image/avif"].includes(imageFile.type)) validationErrors.imageFile = "Choose a PNG, JPG, WebP, or AVIF image.";
      if (imageFile && imageFile.size > 5 * 1024 * 1024) validationErrors.imageFile = "Choose an image smaller than 5 MB.";
      if (Object.keys(validationErrors).length) {
        setFieldErrors(validationErrors);
        setError("Review the highlighted fields, then save again.");
        return;
      }
      const payload = {
        id, name: artistForm.name.trim(), name_japanese: artistForm.nameJapanese.trim(), initials: artistForm.initials.trim().toUpperCase(), bio: artistForm.bio.trim(),
        debut_year: Number(artistForm.debut), youtube_subscribers: Number(artistForm.youtube), spotify_monthly_listeners: Number(artistForm.spotify),
        accent: "#d84a69", accent_soft: "#482432", image_credit: artistForm.imageCredit.trim() || null, image_source_url: artistForm.imageSourceUrl.trim() || null,
      };
      const exists = artists.some((artist) => artist.id === id);
      const { error: artistError } = exists
        ? await supabase.from("artists").update(payload).eq("id", id)
        : await supabase.from("artists").insert(payload);
      if (artistError) throw new Error(`Artist details: ${artistError.message}`);

      for (const name of genreNames) {
        const { error: genreError } = await supabase.from("genres").upsert({ name }, { onConflict: "name" });
        if (genreError) throw new Error(`Genres: ${genreError.message}`);
      }
      const { data: genreRows, error: genreLoadError } = await supabase.from("genres").select("id, name").in("name", genreNames);
      if (genreLoadError) throw new Error(`Genres: ${genreLoadError.message}`);
      const { error: deleteGenreError } = await supabase.from("artist_genres").delete().eq("artist_id", id);
      if (deleteGenreError) throw new Error(`Artist genres: ${deleteGenreError.message}`);
      if (genreRows?.length) {
        const { error: linkError } = await supabase.from("artist_genres").insert(genreRows.map((genre) => ({ artist_id: id, genre_id: genre.id })));
        if (linkError) throw new Error(`Artist genres: ${linkError.message}`);
      }
      if (imageFile) {
        const extension = imageFile.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const path = `${id}/profile.${extension}`;
        const { error: uploadError } = await supabase.storage.from("artist-images").upload(path, imageFile, { upsert: true, contentType: imageFile.type, cacheControl: "3600" });
        if (uploadError) throw new Error(`Artist image upload: ${uploadError.message}`);
        const { data: imageData } = supabase.storage.from("artist-images").getPublicUrl(path);
        const { error: imageError } = await supabase.from("artists").update({ image_url: `${imageData.publicUrl}?v=${Date.now()}` }).eq("id", id);
        if (imageError) throw new Error(`Artist image URL: ${imageError.message}`);
      }
      const snapshots = [
        { artist_id: id, platform: "youtube", metric: "subscribers", value: Number(artistForm.youtube) },
        { artist_id: id, platform: "spotify", metric: "monthly_listeners", value: Number(artistForm.spotify) },
      ];
      const { error: snapshotError } = await supabase.from("popularity_snapshots").insert(snapshots);
      if (snapshotError) throw new Error(`Popularity snapshot: ${snapshotError.message}`);
      await loadCatalogue();
      setMessage(`Saved ${artistForm.name.trim()}.`);
    } catch (saveError) {
      const details = errorText(saveError);
      const mappedErrors = databaseFieldErrors(details, true);
      setFieldErrors(mappedErrors);
      setError(mappedErrors._form ?? `Could not save the artist. ${details}`);
    }
    finally { setSaving(false); }
  };

  const saveSong = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); clearFeedback();
    try {
      const id = songForm.id.trim().toLowerCase();
      const validationErrors: FieldErrors = {};
      if (!/^[a-z0-9-]+$/.test(id)) validationErrors.id = "Use lowercase letters, numbers, and hyphens only, for example: gurenge.";
      if (!songForm.artistId) validationErrors.artistId = "Select the artist who performs this song.";
      if (!songForm.title.trim()) validationErrors.title = "Enter the song title.";
      if (!songForm.release.trim()) validationErrors.release = "Enter the release or album name.";
      const year = Number(songForm.year);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) validationErrors.year = "Enter a whole year between 1900 and 2100.";
      const duration = Number(songForm.duration);
      if (!Number.isInteger(duration) || duration < 1 || duration > 3600) validationErrors.duration = "Enter a duration from 1 to 3600 seconds.";
      if (Object.keys(validationErrors).length) { setFieldErrors(validationErrors); setError("Review the highlighted fields, then save again."); return; }
      const payload = { id, artist_id: songForm.artistId, title: songForm.title.trim(), title_japanese: songForm.titleJapanese.trim() || null, release_name: songForm.release.trim(), release_year: Number(songForm.year), duration_seconds: Number(songForm.duration) };
      const exists = songs.some((song) => song.id === id);
      const { error: songError } = exists ? await createClient().from("songs").update(payload).eq("id", id) : await createClient().from("songs").insert(payload);
      if (songError) throw new Error(`Song details: ${songError.message}`);
      await loadCatalogue();
      setMessage(`Saved ${songForm.title.trim()}.`);
    } catch (saveError) {
      const details = errorText(saveError);
      const mappedErrors = databaseFieldErrors(details, false);
      setFieldErrors(mappedErrors);
      setError(mappedErrors._form ?? `Could not save the song. ${details}`);
    }
    finally { setSaving(false); }
  };

  const deleteItem = async (table: "artists" | "songs", id: string) => {
    if (!id || !window.confirm(`Delete this ${table === "artists" ? "artist and their songs" : "song"}? This cannot be undone.`)) return;
    setError(""); setMessage("");
    const { error: deleteError } = await createClient().from(table).delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    await loadCatalogue();
    if (table === "artists") setArtistForm(blankArtist); else setSongForm(blankSong);
    setMessage("Deleted successfully.");
  };

  if (!configured) return <main className="page"><p className="empty-state">Configure Supabase before using administration.</p></main>;
  if (!hydrated) return <main className="page"><p className="empty-state">Checking access…</p></main>;
  if (!user || profile?.role !== "admin") return <main className="page"><section className="empty-state"><h1>Admin access required</h1><p>This page is available only to accounts promoted to the administrator role in Supabase.</p></section></main>;

  return <main className="page admin-page">
    <section className="page-heading"><p className="eyebrow">Catalogue management</p><h1>Admin studio</h1><p>Add or update artists and songs. Audience figures are manual sample values, not live social-media data.</p></section>
    <nav className="admin-subnav" aria-label="Catalogue sections"><Link href="/admin/artists">Find artists</Link><Link href="/admin/songs">Find songs</Link><Link href="/admin/reviews">Reviews</Link><Link className="active" href="/admin">Editor</Link></nav>
    <div className="tab-list" role="tablist" aria-label="Catalogue editor"><button className={tab === "artists" ? "active" : ""} onClick={() => setTab("artists")} role="tab" aria-selected={tab === "artists"}>Artists</button><button className={tab === "songs" ? "active" : ""} onClick={() => setTab("songs")} role="tab" aria-selected={tab === "songs"}>Songs</button></div>
    {message ? <p className="form-message success">{message}</p> : null}{error ? <p className="form-message error">{error}</p> : null}
    {Object.entries(fieldErrors).some(([field]) => field !== "_form") ? <ul className="field-error-summary">{Object.entries(fieldErrors).filter(([field]) => field !== "_form").map(([field, fieldErrorMessage]) => <li key={field}><strong>{field}</strong>: {fieldErrorMessage}</li>)}</ul> : null}
    {tab === "artists" ? <section className="admin-editor"><label>Choose an artist or create a new one<select value={artistForm.id} onChange={(event) => selectArtist(event.target.value)}><option value="">New artist</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></label><form onSubmit={saveArtist} className="admin-form"><label>URL-safe ID<input value={artistForm.id} onChange={(event) => setArtistForm({ ...artistForm, id: event.target.value })} required /></label><label>Name<input value={artistForm.name} onChange={(event) => setArtistForm({ ...artistForm, name: event.target.value })} required /></label><label>Japanese / display name<input value={artistForm.nameJapanese} onChange={(event) => setArtistForm({ ...artistForm, nameJapanese: event.target.value })} required /></label><label>Initials<input maxLength={3} value={artistForm.initials} onChange={(event) => setArtistForm({ ...artistForm, initials: event.target.value })} required /></label><label>Debut year<input type="number" min="1900" max="2100" value={artistForm.debut} onChange={(event) => setArtistForm({ ...artistForm, debut: event.target.value })} required /></label><label>Genres (comma separated)<input value={artistForm.genres} onChange={(event) => setArtistForm({ ...artistForm, genres: event.target.value })} /></label><label>YouTube subscribers (sample)<input type="number" min="0" value={artistForm.youtube} onChange={(event) => setArtistForm({ ...artistForm, youtube: event.target.value })} required /></label><label>Spotify listeners (sample)<input type="number" min="0" value={artistForm.spotify} onChange={(event) => setArtistForm({ ...artistForm, spotify: event.target.value })} required /></label><label>Image credit (if required)<input value={artistForm.imageCredit} onChange={(event) => setArtistForm({ ...artistForm, imageCredit: event.target.value })} /></label><label>Image source URL (if required)<input type="url" value={artistForm.imageSourceUrl} onChange={(event) => setArtistForm({ ...artistForm, imageSourceUrl: event.target.value })} /></label><label className="wide-field">Biography<textarea value={artistForm.bio} onChange={(event) => setArtistForm({ ...artistForm, bio: event.target.value })} required /></label><label className="wide-field">Upload artist image (optional, ≤ 5 MB)<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label><div className="admin-actions wide-field"><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save artist"}</button>{artists.some((artist) => artist.id === artistForm.id) ? <button type="button" className="danger-button" onClick={() => void deleteItem("artists", artistForm.id)}>Delete artist</button> : null}</div></form></section> : <section className="admin-editor"><label>Choose a song or create a new one<select value={songForm.id} onChange={(event) => selectSong(event.target.value)}><option value="">New song</option>{songs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label><form onSubmit={saveSong} className="admin-form"><label>URL-safe ID<input value={songForm.id} onChange={(event) => setSongForm({ ...songForm, id: event.target.value })} required /></label><label>Artist<select value={songForm.artistId} onChange={(event) => setSongForm({ ...songForm, artistId: event.target.value })} required><option value="">Select artist</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></label><label>Song title<input value={songForm.title} onChange={(event) => setSongForm({ ...songForm, title: event.target.value })} required /></label><label>Japanese title<input value={songForm.titleJapanese} onChange={(event) => setSongForm({ ...songForm, titleJapanese: event.target.value })} /></label><label>Release<input value={songForm.release} onChange={(event) => setSongForm({ ...songForm, release: event.target.value })} required /></label><label>Release year<input type="number" min="1900" max="2100" value={songForm.year} onChange={(event) => setSongForm({ ...songForm, year: event.target.value })} required /></label><label>Duration (seconds)<input type="number" min="1" max="3600" value={songForm.duration} onChange={(event) => setSongForm({ ...songForm, duration: event.target.value })} required /></label><div className="admin-actions wide-field"><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save song"}</button>{songs.some((song) => song.id === songForm.id) ? <button type="button" className="danger-button" onClick={() => void deleteItem("songs", songForm.id)}>Delete song</button> : null}</div></form></section>}
  </main>;
}
