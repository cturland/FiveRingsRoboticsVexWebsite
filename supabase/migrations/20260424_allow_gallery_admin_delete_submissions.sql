create policy "Gallery admins can delete submissions"
on public.gallery_submissions
for delete
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);
