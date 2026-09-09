-- Apply after 202609080001_phase_2.sql.
-- Adds user profile pictures and attributed artist-image fields.

alter table public.profiles add column avatar_url text;
alter table public.artists add column image_url text;
alter table public.artists add column image_credit text;
alter table public.artists add column image_source_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

create policy "Avatar images are publicly readable" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "Users upload avatars in their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update avatars in their own folder" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete avatars in their own folder" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Creative Commons artist photographs. The UI links to the source for attribution.
update public.artists
set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Yoasobi.jpg?width=960', image_credit = 'Colleen Sturtevant · CC BY-SA 4.0', image_source_url = 'https://commons.wikimedia.org/wiki/File:Yoasobi.jpg'
where id = 'yoasobi';

update public.artists
set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fujii_Kaze_performing_during_Best_Of_Fujii_Kaze_2020-2024_Asia_Tour_in_Axiata_Arena_Kuala_Lumpur_(cropped)_(2).jpg?width=901', image_credit = 'KazeQal · CC BY 4.0', image_source_url = 'https://commons.wikimedia.org/wiki/File:Fujii_Kaze_performing_during_Best_Of_Fujii_Kaze_2020-2024_Asia_Tour_in_Axiata_Arena_Kuala_Lumpur_(cropped)_(2).jpg'
where id = 'fujii-kaze';

-- Add approved, appropriately attributed image URLs for the remaining artists
-- through the Supabase Table Editor or a future content-management workflow.
