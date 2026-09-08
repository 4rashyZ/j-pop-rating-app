type IconProps = { size?: number; filled?: boolean };

export function HomeIcon({ size = 22 }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

export function HeartIcon({ size = 22, filled = false }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

export function SearchIcon({ size = 20 }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

export function PlayIcon({ size = 22 }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" fill="currentColor" /></svg>;
}

export function StarIcon({ size = 18, filled = false }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9L12 2.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

export function MenuIcon({ size = 22 }: IconProps) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
