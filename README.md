# 21052A Robotics Team Website

A Next.js site for Five Rings Robotics (Team 21052A) with:
- team information
- fixtures and results
- a public Highlights page
- a protected student upload flow
- a simple admin approval workflow for new photo submissions

## Run locally

1. Use Node.js 24 LTS and install dependencies:

```bash
npm ci
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

## School Google sign-in

The team sites use the Google provider in the shared Supabase Auth project. In Google Auth Platform, create a Web application OAuth client. Use an Internal audience if both school email domains belong to the same ISL Google Workspace organization.

- Authorized JavaScript origins: `https://five-rings-robotics-vex-website.vercel.app` and `https://cool-runnings-vex.vercel.app`.
- Authorized redirect URI: the exact callback shown in Supabase's Google provider settings, `https://uiudkwytowxakoohamjk.supabase.co/auth/v1/callback`.
- In Supabase, enable Google and enter the Client ID and Client Secret in the Google provider settings. Keep the secret out of the repository and Vercel.
- Supabase's Auth redirect list should include each team's `/auth/callback` URL. Each site still checks the signed-in school email against its own team access records.

[Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

## Environment variables

Set these in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET=gallery-uploads
NEXT_PUBLIC_SUPABASE_TEAM_PROFILE_BUCKET=team-profile-photos
SUPABASE_SECRET_KEY=your_server_only_supabase_secret_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ROBOTEVENTS_API_TOKEN=your_api_token_here
ROBOTEVENTS_DEBUG=false
```

Set `ROBOTEVENTS_DEBUG=true` in `.env.local` if you want verbose RobotEvents request logging while debugging locally.

## Student upload flow

Approved school email addresses are stored in the private Supabase table `private.team_site_members`. Only approved team members and gallery admins can use the protected upload and profile features.

Uploads go through this flow:

1. student signs in with their ISL Google account
2. approved uploader submits image, title, category, and date
3. the image is stored in a private Supabase Storage bucket
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

For a fresh project, apply all files in [supabase/migrations](supabase/migrations) in timestamp order. For a local Supabase stack, run `supabase init` once, then `supabase start` and `supabase db reset`. Use synthetic addresses for local testing.

The original Five Rings database was set up manually. For that existing database:

1. Check that the baseline objects are present and take a backup. After verifying the baseline, record version `20261112133901` as already applied in the linked project's migration history. Do not replay the baseline on the live database.
2. Configure `SUPABASE_SECRET_KEY` in Vercel as a server-only variable. Test the new build against a staging database. The preparation migration adds the new public views and private member table while the previous deployment is still live.
3. Apply the preparation migration and transfer the approved member addresses into `private.team_site_members` using the Supabase SQL editor or a trusted database connection. Use the existing list from a trusted local copy, and keep the addresses out of Git, tickets and logs. Gallery admins already listed in `public.gallery_admins` retain access. Check that all intended members are present, then build and deploy the new app against production so the public pages are generated with the new views.
4. Verify the new deployment serves profiles and approved photos. Apply the enforcement migration to make both buckets private and restrict direct access to the source tables.
5. Verify signed-out access to team pages and approved photos, a member Google sign-in and upload, an admin preview and approval, and the denial of an old public URL for a pending photo. Review cached image URLs and older Vercel deployments that served the original public URLs.

Removing the allowlist from the working tree leaves it in older commits. Coordinate any history rewrite with ISL and other repository collaborators, and follow GitHub's guidance for removing cached references and handling forks and clones: [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Editing team data

Team profiles now live in Supabase through the protected member profile flow at `/profile`.

Fixtures and results fallback data live in:

- [`data/fixtures.json`](data/fixtures.json)
- [`data/results.json`](data/results.json)

## Project structure

- [`src/app/page.tsx`](src/app/page.tsx): homepage
- [`src/app/gallery/page.tsx`](src/app/gallery/page.tsx): public Highlights page
- [`src/app/upload/page.tsx`](src/app/upload/page.tsx): protected student upload page
- [`src/app/profile/page.tsx`](src/app/profile/page.tsx): protected member profile page
- [`src/app/admin/page.tsx`](src/app/admin/page.tsx): admin hub
- [`src/app/admin/gallery/page.tsx`](src/app/admin/gallery/page.tsx): admin approval page
- [`src/app/admin/team/page.tsx`](src/app/admin/team/page.tsx): admin team profile management
- [`src/lib/gallery.ts`](src/lib/gallery.ts): approved Highlights reader
- [`src/lib/gallerySubmissions.ts`](src/lib/gallerySubmissions.ts): pending submission insert helper
- [`src/lib/galleryAdmin.ts`](src/lib/galleryAdmin.ts): admin moderation data helper
- [`src/lib/teamProfiles.ts`](src/lib/teamProfiles.ts): team profile readers

## Notes

- The public Highlights page no longer reads from `data/gallery.json`; it reads approved Supabase submissions.
- The old blog feature has been removed.
- If uploads fail, check your Supabase bucket, RLS policies, and table migrations first.
