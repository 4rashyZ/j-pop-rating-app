"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeartIcon, HomeIcon, MenuIcon } from "./icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu"><MenuIcon /></button>
        <Link className="brand" href="/" aria-label="OTO home">
          <span className="brand-mark"><span /></span>
          <span>OTO</span>
        </Link>
        <div className="topbar-tagline">Your J-Pop rotation</div>
        <div className="avatar">JP</div>
      </header>

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <nav aria-label="Main navigation">
          <Link className={pathname === "/" ? "nav-link active" : "nav-link"} href="/" onClick={() => setMenuOpen(false)}><HomeIcon /><span>Discover</span></Link>
          <Link className={pathname === "/favourites" ? "nav-link active" : "nav-link"} href="/favourites" onClick={() => setMenuOpen(false)}><HeartIcon /><span>Favourites</span></Link>
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">PHASE 1</span>
          <p>Your ratings are saved on this device.</p>
        </div>
      </aside>
      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <main className="main-content">{children}</main>
    </div>
  );
}
