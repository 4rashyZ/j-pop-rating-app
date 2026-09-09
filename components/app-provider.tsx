"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Ratings = Record<string, number>;
export type Profile = { displayName: string; avatarUrl: string | null; role: "user" | "admin" };
type AppContextValue = {
  user: User | null;
  profile: Profile | null;
  favourites: string[];
  ratings: Ratings;
  hydrated: boolean;
  configured: boolean;
  toggleFavourite: (artistId: string) => Promise<void>;
  setRating: (songId: string, rating: number) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Ratings>({});
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const supabase = createClient();
    const loadPersonalData = async (userId: string) => {
      const [{ data: profileData, error: profileError }, { data: favouriteData, error: favouriteError }, { data: ratingData, error: ratingError }] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url, role").eq("id", userId).maybeSingle(),
        supabase.from("favourites").select("artist_id").eq("user_id", userId),
        supabase.from("ratings").select("song_id, rating").eq("user_id", userId),
      ]);
      if (profileError || favouriteError || ratingError) return;
      setProfile(profileData ? {
        displayName: profileData.display_name,
        avatarUrl: profileData.avatar_url,
        role: profileData.role === "admin" ? "admin" : "user",
      } : null);
      setFavourites((favouriteData ?? []).map((row) => row.artist_id));
      setRatings(Object.fromEntries((ratingData ?? []).map((row) => [row.song_id, row.rating])));
    };

    const initialise = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await loadPersonalData(session.user.id);
      setHydrated(true);
    };
    void initialise();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadPersonalData(session.user.id);
      else {
        setFavourites([]);
        setRatings({});
        setProfile(null);
      }
      setHydrated(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleFavourite = async (artistId: string) => {
    if (!user) throw new Error("Please sign in to save favourites.");
    const supabase = createClient();
    if (favourites.includes(artistId)) {
      const { error } = await supabase.from("favourites").delete().eq("artist_id", artistId).eq("user_id", user.id);
      if (error) throw error;
      setFavourites((current) => current.filter((id) => id !== artistId));
      return;
    }
    const { error } = await supabase.from("favourites").insert({ artist_id: artistId, user_id: user.id });
    if (error) throw error;
    setFavourites((current) => [...current, artistId]);
  };

  const setRating = async (songId: string, rating: number) => {
    if (!user) throw new Error("Please sign in to rate songs.");
    const { error } = await createClient().from("ratings").upsert({ song_id: songId, user_id: user.id, rating }, { onConflict: "user_id,song_id" });
    if (error) throw error;
    setRatings((current) => ({ ...current, [songId]: rating }));
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await createClient().auth.signOut();
    if (error) throw error;
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error("Please sign in to upload a profile picture.");
    if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
    if (file.size > 2 * 1024 * 1024) throw new Error("Choose an image smaller than 2 MB.");
    const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const path = `${user.id}/avatar.${extension}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: profileError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    if (profileError) throw profileError;
    setProfile((current) => current ? { ...current, avatarUrl } : {
      displayName: user.email?.split("@")[0] ?? "OTO listener",
      avatarUrl,
      role: "user",
    });
  };

  const updateProfile = async (displayName: string) => {
    if (!user) throw new Error("Please sign in to update your profile.");
    const trimmedName = displayName.trim();
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      throw new Error("Display name must be between 1 and 60 characters.");
    }
    const { error } = await createClient().from("profiles").update({ display_name: trimmedName }).eq("id", user.id);
    if (error) throw error;
    setProfile((current) => current ? { ...current, displayName: trimmedName } : current);
  };

  return <AppContext.Provider value={{ user, profile, favourites, ratings, hydrated, configured: isSupabaseConfigured, toggleFavourite, setRating, uploadAvatar, updateProfile, signOut }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
