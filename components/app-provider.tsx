"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Ratings = Record<string, number>;
type AppContextValue = {
  favourites: string[];
  ratings: Ratings;
  hydrated: boolean;
  toggleFavourite: (artistId: string) => void;
  setRating: (songId: string, rating: number) => void;
};

const AppContext = createContext<AppContextValue | null>(null);
const FAVOURITES_KEY = "oto-favourites";
const RATINGS_KEY = "oto-ratings";

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Ratings>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavourites(readStored<string[]>(FAVOURITES_KEY, []));
    setRatings(readStored<Ratings>(RATINGS_KEY, {}));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
  }, [favourites, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings, hydrated]);

  const toggleFavourite = (artistId: string) => {
    setFavourites((current) => current.includes(artistId) ? current.filter((id) => id !== artistId) : [...current, artistId]);
  };

  const setRating = (songId: string, rating: number) => {
    setRatings((current) => ({ ...current, [songId]: rating }));
  };

  return <AppContext.Provider value={{ favourites, ratings, hydrated, toggleFavourite, setRating }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
