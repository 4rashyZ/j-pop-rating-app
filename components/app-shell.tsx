"use client";

/* Native images support dynamic Supabase Storage avatar URLs without image-host configuration. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { HeartIcon, HomeIcon, MenuIcon, MusicIcon, StarIcon } from "./icons";
import { useApp } from "./app-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, profile, signOut, uploadAvatar } = useApp();
  const initials = profile?.displayName?.slice(0, 2).toUpperCase() ?? user?.email?.slice(0, 2).toUpperCase() ?? "JP";
  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Your profile picture could not be uploaded.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu"><MenuIcon /></button>
        <Link className="brand" href="/" aria-label="OTO home">
          <span className="brand-mark"><span /></span>
          <span>OTO</span>
        </Link>
        <div className="topbar-tagline">Your J-Pop rotation</div>
        {user ? <div className="account-menu"><button className="avatar avatar-button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-haspopup="menu" aria-label="Open account menu">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Your profile" /> : initials}</button>{accountOpen && <div className="account-popover" role="menu"><div className="account-summary">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <span className="account-initials">{initials}</span>}<div><strong>{profile?.displayName ?? "OTO listener"}</strong><span>{user.email}</span></div></div><Link className="account-link" role="menuitem" href="/profile" onClick={() => setAccountOpen(false)}>Your profile</Link><label className="upload-avatar" role="menuitem">Upload profile picture<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleAvatarUpload(event)} /></label>{profile?.role === "admin" ? <Link className="account-link" role="menuitem" href="/admin" onClick={() => setAccountOpen(false)}>Catalogue admin</Link> : null}<button className="sign-out-button" role="menuitem" onClick={() => { setAccountOpen(false); void signOut(); }}>Sign out</button></div>}</div> : <Link className="sign-in-link" href="/auth">Sign in</Link>}
      </header>

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <nav aria-label="Main navigation">
          <Link className={pathname === "/" ? "nav-link active" : "nav-link"} href="/" onClick={() => setMenuOpen(false)}><HomeIcon /><span>Discover</span></Link>
          <Link className={pathname.startsWith("/songs") ? "nav-link active" : "nav-link"} href="/songs" onClick={() => setMenuOpen(false)}><MusicIcon /><span>Songs</span></Link>
          <Link className={pathname === "/rankings" ? "nav-link active" : "nav-link"} href="/rankings" onClick={() => setMenuOpen(false)}><StarIcon /><span>Rankings</span></Link>
          <Link className={pathname === "/favourites" ? "nav-link active" : "nav-link"} href="/favourites" onClick={() => setMenuOpen(false)}><HeartIcon /><span>Favourites</span></Link>
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">PHASE 4</span>
          <p>{user ? "Ratings, reviews, and favourites are saved to your account." : "Sign in to rate songs, write reviews, and save favourites."}</p>
        </div>
      </aside>
      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <main className="main-content">{children}</main>
    </div>
  );
}
