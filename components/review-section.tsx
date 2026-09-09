"use client";

/* Review avatars are dynamic public Supabase Storage URLs. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/app-provider";
import { createClient } from "@/lib/supabase/client";

type PublicReview = { reviewId: string; body: string; displayName: string; avatarUrl: string | null; rating: number; updatedAt: string };
type OwnReview = { id: string; body: string; status: "published" | "hidden"; moderationReason: string | null };

export function ReviewSection({ songId }: { songId: string }) {
  const { user, ratings } = useApp();
  const router = useRouter();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [ownReview, setOwnReview] = useState<OwnReview | null>(null);
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    const supabase = createClient();
    const { data, error: publicError } = await supabase.from("published_reviews").select("review_id, body, display_name, avatar_url, rating, updated_at").eq("song_id", songId).order("updated_at", { ascending: false });
    if (publicError) throw publicError;
    setReviews((data ?? []).map((review) => ({ reviewId: review.review_id, body: review.body, displayName: review.display_name, avatarUrl: review.avatar_url, rating: Number(review.rating), updatedAt: review.updated_at })));
    if (!user) { setOwnReview(null); return; }
    const { data: ownData, error: ownError } = await supabase.from("reviews").select("id, body, status, moderation_reason").eq("user_id", user.id).eq("song_id", songId).maybeSingle();
    if (ownError) throw ownError;
    const mapped = ownData ? { id: ownData.id, body: ownData.body, status: ownData.status as "published" | "hidden", moderationReason: ownData.moderation_reason } : null;
    setOwnReview(mapped);
    setBody(mapped?.body ?? "");
  }, [songId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReviews().catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Could not load reviews.")), 0);
    return () => window.clearTimeout(timer);
  }, [loadReviews]);

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !ratings[songId] || ownReview?.status === "hidden") return;
    const reviewBody = body.trim();
    if (reviewBody.length < 10 || reviewBody.length > 1000) { setError("Your review must be between 10 and 1,000 characters."); return; }
    setSaving(true); setError(""); setMessage("");
    const supabase = createClient();
    const result = ownReview
      ? await supabase.from("reviews").update({ body: reviewBody }).eq("id", ownReview.id).eq("user_id", user.id)
      : await supabase.from("reviews").insert({ user_id: user.id, song_id: songId, body: reviewBody });
    if (result.error) setError(result.error.message);
    else { setMessage(ownReview ? "Review updated." : "Review published."); await loadReviews(); }
    setSaving(false);
  };

  const deleteReview = async () => {
    if (!user || !ownReview || !window.confirm("Delete your review? This cannot be undone.")) return;
    const { error: deleteError } = await createClient().from("reviews").delete().eq("id", ownReview.id).eq("user_id", user.id);
    if (deleteError) { setError(deleteError.message); return; }
    setBody(""); setMessage("Review deleted."); await loadReviews();
  };

  const reportReview = async (reviewId: string) => {
    if (!user) { router.push(`/auth?next=${encodeURIComponent(window.location.pathname)}`); return; }
    const reason = window.prompt("Why are you reporting this review? Please enter at least 5 characters.")?.trim();
    if (!reason) return;
    if (reason.length < 5 || reason.length > 500) { setError("A report reason must be between 5 and 500 characters."); return; }
    const { error: reportError } = await createClient().from("review_reports").insert({ reporter_id: user.id, review_id: reviewId, reason });
    if (reportError) setError(reportError.code === "23505" ? "You have already reported this review." : reportError.message);
    else setMessage("Review reported to the moderators.");
  };

  return <section className="reviews-section">
    <div className="section-heading"><div><p className="eyebrow">Listener notes</p><h2>Community reviews</h2></div><span className="song-count">{reviews.length} published</span></div>
    <div className="review-composer">
      {!user ? <p><Link className="text-link" href={`/auth?next=/songs/${songId}`}>Sign in</Link> and rate this song to write a review.</p> : !ratings[songId] ? <p>Choose a rating above before writing a review.</p> : ownReview?.status === "hidden" ? <div><strong>Your review is hidden by a moderator.</strong><p>{ownReview.moderationReason ?? "Contact an administrator if you need more information."}</p><button className="danger-button" onClick={() => void deleteReview()}>Delete review</button></div> : <form onSubmit={saveReview}><label>Your review<textarea maxLength={1000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="What stands out about this song?" /></label><div className="review-form-actions"><span>{body.length}/1000</span><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : ownReview ? "Update review" : "Publish review"}</button>{ownReview ? <button type="button" className="danger-button" onClick={() => void deleteReview()}>Delete</button> : null}</div></form>}
      {message ? <p className="form-message success">{message}</p> : null}{error ? <p className="form-message error">{error}</p> : null}
    </div>
    <div className="review-list">{reviews.map((review) => <article className="review-card" key={review.reviewId}><header>{review.avatarUrl ? <img src={review.avatarUrl} alt="" /> : <span className="review-avatar">{review.displayName.slice(0, 2).toUpperCase()}</span>}<div><strong>{review.displayName}</strong><span>{review.rating}/10 · {new Date(review.updatedAt).toLocaleDateString()}</span></div></header><p>{review.body}</p>{ownReview?.id !== review.reviewId ? <button className="report-button" onClick={() => void reportReview(review.reviewId)}>Report review</button> : null}</article>)}{reviews.length === 0 ? <p className="empty-state">No published reviews yet. Be the first listener to share a note.</p> : null}</div>
  </section>;
}
