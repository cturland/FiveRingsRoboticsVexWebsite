alter table public.gallery_submissions
  add column if not exists media_type text not null default 'image',
  add column if not exists youtube_url text,
  add column if not exists youtube_video_id text;

alter table public.gallery_submissions
  alter column image_path drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_submissions_media_type_check'
  ) then
    alter table public.gallery_submissions
      add constraint gallery_submissions_media_type_check
      check (
        media_type in ('image', 'youtube')
        and (
          (media_type = 'image' and image_path is not null and youtube_video_id is null)
          or
          (media_type = 'youtube' and image_path is null and youtube_url is not null and youtube_video_id is not null)
        )
      );
  end if;
end
$$;

create index if not exists gallery_submissions_media_type_idx
  on public.gallery_submissions (media_type);
