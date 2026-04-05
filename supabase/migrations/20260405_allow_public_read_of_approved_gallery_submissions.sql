create policy "Public can view approved gallery submissions"
on public.gallery_submissions
for select
to public
using (status = 'approved');
