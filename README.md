# 21052A Robotics Team Website

A Next.js site for Five Rings Robotics (Team 21052A) with:
- team information
- fixtures and results
- a public Highlights page
- a protected student upload flow
- a simple admin approval workflow for new photo submissions

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open:

`http://localhost:3000`

4. Run lint anytime:

```bash
npm run lint
```

## Environment variables

Set these in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=gallery-uploads
NEXT_PUBLIC_SUPABASE_TEAM_PROFILE_BUCKET=team-profile-photos
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ROBOTEVENTS_API_TOKEN=your_api_token_here
ROBOTEVENTS_DEBUG=false
```

Set `ROBOTEVENTS_DEBUG=true` in `.env.local` if you want verbose RobotEvents request logging while debugging locally.

## Student upload flow

Student upload access is controlled by:

- [`data/upload-allowed-users.json`](data/upload-allowed-users.json)

Only approved school email addresses can sign in and submit uploads.

Uploads go through this flow:

1. student signs in with Supabase magic link
2. approved uploader submits image, title, category, and date
3. image is stored in Supabase Storage
4. a `gallery_submissions` row is created with `status = 'pending'`
5. admin approves it
6. approved items appear on the public Highlights page and homepage preview

## Admin approval flow

Admin access is controlled by the `gallery_admins` table in Supabase.

Add an admin with:

```sql
insert into public.gallery_admins (email)
values ('your-email@isl.ch');
```

Then sign in and open:

`/admin/gallery`

## Supabase migrations

This repo includes migrations for:

- gallery uploads bucket
- gallery submissions table
- approved public gallery read policy
- gallery admins table and approval permissions

They live in:

- [`supabase/migrations`](supabase/migrations)

## Editing team data

Team profiles now live in Supabase through the protected member profile flow at `/profile`.

Fixtures and results fallback data live in:

- [`data/fixtures.json`](data/fixtures.json)
- [`data/results.json`](data/results.json)

## Project structure

- [`src/app/page.tsx`](src/app/page.tsx): homepage
- [`src/app/gallery/page.tsx`](src/app/gallery/page.tsx): public Highlights page
- [`src/app/upload/page.tsx`](src/app/upload/page.tsx): protected student upload page
- [`src/app/admin/gallery/page.tsx`](src/app/admin/gallery/page.tsx): admin approval page
- [`src/lib/gallery.ts`](src/lib/gallery.ts): approved Highlights reader
- [`src/lib/gallerySubmissions.ts`](src/lib/gallerySubmissions.ts): pending submission insert helper
- [`src/lib/galleryAdmin.ts`](src/lib/galleryAdmin.ts): admin moderation data helper

## Notes

- The public Highlights page no longer reads from `data/gallery.json`; it reads approved Supabase submissions.
- The old blog feature has been removed.
- If uploads fail, check your Supabase bucket, RLS policies, and table migrations first.
