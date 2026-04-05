create table if not exists public.gallery_admins (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.gallery_admins enable row level security;

create policy "Gallery admins can view their own admin record"
on public.gallery_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Gallery admins can view all submissions"
on public.gallery_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create policy "Gallery admins can update submissions"
on public.gallery_submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);
