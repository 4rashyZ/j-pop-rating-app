"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useApp } from "@/components/app-provider";
import { createClient } from "@/lib/supabase/client";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, configured, hydrated } = useApp();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";

  useEffect(() => { if (hydrated && user) router.replace(next); }, [hydrated, next, router, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(""); setSubmitting(true);
    const supabase = createClient();
    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim() } } });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
      else router.replace(next);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.replace(next);
    }
    setSubmitting(false);
  };

  if (!configured) return <div className="auth-page"><div className="auth-card"><Link className="brand" href="/"><span className="brand-mark"><span /></span><span>OTO</span></Link><h1>Connect Supabase first</h1><p>Add your project URL and publishable key to `.env.local`, then restart the development server.</p><Link href="/" className="primary-button">Back to discover</Link></div></div>;
  return <div className="auth-page"><div className="auth-card"><Link className="brand" href="/"><span className="brand-mark"><span /></span><span>OTO</span></Link><span className="eyebrow">YOUR J-POP COLLECTION</span><h1>{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1><p>{mode === "sign-in" ? "Sign in to rate tracks and sync your favourites." : "Create an account to keep your ratings across devices."}</p><form onSubmit={(event) => void submit(event)}>{mode === "sign-up" && <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="How should we call you?" maxLength={60} required /></label>}<label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} placeholder="At least 6 characters" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required /></label>{message && <p className="form-message" role="status">{message}</p>}<button className="primary-button auth-submit" disabled={submitting}>{submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode((current) => current === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }}>{mode === "sign-in" ? "New to OTO? Create an account" : "Already have an account? Sign in"}</button></div></div>;
}

export default function AuthPage() {
  return <Suspense fallback={<div className="auth-page"><div className="auth-card"><p>Loading…</p></div></div>}><AuthForm /></Suspense>;
}
