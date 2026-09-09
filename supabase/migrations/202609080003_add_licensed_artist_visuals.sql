-- Apply after 202609080002_profile_avatars_and_artist_images.sql.
-- Adds further artist visuals with reuse-friendly Creative Commons licences.

update public.artists
set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ado_(Chanteuse).png?width=960',
    image_credit = 'Kiwiimoka · CC0 1.0',
    image_source_url = 'https://commons.wikimedia.org/wiki/File:Ado_(Chanteuse).png'
where id = 'ado';

update public.artists
set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Atarashii_Gakko!_performing_in_London._10th_June_2024.jpg?width=1200',
    image_credit = 'Sleepyfill99 · CC0 1.0',
    image_source_url = 'https://commons.wikimedia.org/wiki/File:Atarashii_Gakko!_performing_in_London._10th_June_2024.jpg'
where id = 'atarashii-gakko';
