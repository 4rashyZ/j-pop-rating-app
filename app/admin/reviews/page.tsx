"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Pagination } from "@/components/pagination";
import { createClient } from "@/lib/supabase/client";

type QueueReview = { id: string; songId: string; songTitle: string; artistName: string; displayName: string; body: string; status: "published" | "hidden"; moderationReason: string | null; rating: number; reports: number; updatedAt: string };

export default function AdminReviewsPage() {
  const reviewsPerPage = 8;
  const { user, profile, hydrated, configured } = useApp();
  const [reviews, setReviews] = useState<QueueReview[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    const { data, error: loadError } = await createClient().from("admin_review_queue").select("*").order("open_report_count", { ascending: false }).order("updated_at", { ascending: false });
    if (loadError) throw loadError;
    setReviews((data ?? []).map((review) => ({ id: review.review_id, songId: review.song_id, songTitle: review.song_title, artistName: review.artist_name, displayName: review.display_name, body: review.body, status: review.status as "published" | "hidden", moderationReason: review.moderation_reason, rating: Number(review.rating), reports: Number(review.open_report_count), updatedAt: review.updated_at })));
  }, []);

  useEffect(() => {
    if (profile?.role !== "admin") return;
    const timer = window.setTimeout(() => void loadReviews().catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load reviews.")), 0);
    return () => window.clearTimeout(timer);
  }, [profile?.role, loadReviews]);

  const matchingReviews = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return reviews.filter((review) => (status === "all" || review.status === status || status === "reported" && review.reports > 0) && (!search || [review.songTitle, review.artistName, review.displayName, review.body].some((value) => value.toLocaleLowerCase().includes(search))));
  }, [reviews, query, status]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(matchingReviews.length / reviewsPerPage)));
  const filtered = useMemo(() => matchingReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage), [matchingReviews, currentPage]);

  const moderate = async (review: QueueReview, nextStatus: "published" | "hidden") => {
    const reason = nextStatus === "hidden" ? window.prompt("Why is this review being hidden? (3–500 characters)")?.trim() : null;
    if (nextStatus === "hidden" && (!reason || reason.length < 3 || reason.length > 500)) { setError("Enter a moderation reason between 3 and 500 characters."); return; }
    setError(""); setMessage("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("reviews").update({ status: nextStatus, moderation_reason: nextStatus === "hidden" ? reason : null }).eq("id", review.id);
    if (updateError) { setError(updateError.message); return; }
    if (review.reports > 0) {
      const { error: reportError } = await supabase.from("review_reports").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("review_id", review.id).eq("status", "open");
      if (reportError) { setError(reportError.message); return; }
    }
    setMessage(nextStatus === "hidden" ? "Review hidden and reports resolved." : "Review published and reports resolved.");
    await loadReviews();
  };

  const deleteReview = async (review: QueueReview) => {
    if (!window.confirm(`Permanently delete ${review.displayName}'s review?`)) return;
    const { error: deleteError } = await createClient().from("reviews").delete().eq("id", review.id);
    if (deleteError) { setError(deleteError.message); return; }
    setMessage("Review deleted.");
    await loadReviews();
  };

  if (!configured) return <main className="page"><p className="empty-state">Configure Supabase before using moderation.</p></main>;
  if (!hydrated) return <main className="page"><p className="empty-state">Loading…</p></main>;
  if (!user || profile?.role !== "admin") return <main className="page"><section className="empty-state"><h1>Admin access required</h1><p>This page is available only to administrator accounts.</p></section></main>;

  return <main className="page admin-catalogue-page">
    <section className="page-heading"><p className="eyebrow">Community safety</p><h1>Review moderation</h1><p>Search published or hidden reviews, prioritise reports, and record why content was moderated.</p></section>
    <nav className="admin-subnav" aria-label="Catalogue sections"><Link href="/admin/artists">Artists</Link><Link href="/admin/songs">Songs</Link><Link className="active" href="/admin/reviews">Reviews</Link><Link href="/admin">Editor</Link></nav>
    <section className="moderation-filters"><label className="catalogue-search"><span>Search reviews</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search song, artist, listener, or review…" /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All reviews</option><option value="reported">Reported</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label></section>
    {message ? <p className="form-message success">{message}</p> : null}
    {error ? <p className="form-message error">{error}</p> : null}
    <section className="moderation-list">
      <p className="result-count">{filtered.length} review{filtered.length === 1 ? "" : "s"}</p>
      {filtered.map((review) => <article className="moderation-card" key={review.id}><header><div><strong>{review.displayName}</strong><span>{review.rating}/10 · {review.songTitle} by {review.artistName} · {new Date(review.updatedAt).toLocaleDateString()}</span></div><span className={`status-badge ${review.status}`}>{review.status}</span></header><p>{review.body}</p>{review.moderationReason ? <p className="moderation-reason">Reason: {review.moderationReason}</p> : null}<footer><Link className="text-link" href={`/songs/${review.songId}`}>Open song</Link>{review.reports ? <strong className="report-count">{review.reports} open report{review.reports === 1 ? "" : "s"}</strong> : null}{review.status === "published" ? <button className="secondary-button" onClick={() => void moderate(review, "hidden")}>Hide review</button> : <button className="secondary-button" onClick={() => void moderate(review, "published")}>Publish review</button>}<button className="danger-button" onClick={() => void deleteReview(review)}>Delete</button></footer></article>)}
      {filtered.length === 0 ? <p className="empty-state">No reviews match this view.</p> : null}
    </section>
    <Pagination currentPage={currentPage} totalItems={matchingReviews.length} pageSize={reviewsPerPage} itemLabel="reviews" onPageChange={setPage} />
  </main>;
}
