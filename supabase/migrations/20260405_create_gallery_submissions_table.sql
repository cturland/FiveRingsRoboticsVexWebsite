create table if not exists public.gallery_submissions (
  id bigint generated always as identity primary key,
  email text not null,
  image_path text not null,
  title text not null,
  category text not null,
  date date not null,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  constraint gallery_submissions_status_check check (status in ('pending', 'approved', 'rejected'))
);

alter table public.gallery_submissions enable row level security;

create index if not exists gallery_submissions_status_created_at_idx
  on public.gallery_submissions (status, created_at desc);

create policy "Authenticated users can insert their own pending gallery submissions"
on public.gallery_submissions
for insert
to authenticated
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
);

create policy "Authenticated users can view their own gallery submissions"
on public.gallery_submissions
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
