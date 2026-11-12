# ISL VEX Robotics Team Websites

A shared Next.js site for Five Rings Robotics (21052A) and Cool Runnings (21052B) with:
- team information
- fixtures and results
- Instagram updates
- member profiles and profile photos
- an optional event gallery with member submissions and admin approval

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

## Team deployments

The same app can be deployed to a separate Vercel project for each team. The default is Five Rings Robotics. Set `NEXT_PUBLIC_TEAM_SITE=cool-runnings` in the Cool Runnings project for team 21052B. Each project uses its own server-side `INSTAGRAM_ACCESS_TOKEN`, with the same variable name in both projects.

For Cool Runnings member profiles, use a dedicated Supabase project and set `NEXT_PUBLIC_COOL_RUNNINGS_SUPABASE_URL` and `NEXT_PUBLIC_COOL_RUNNINGS_SUPABASE_ANON_KEY`. The app ignores the Five Rings Supabase variables in this mode. Set `SUPABASE_SECRET_KEY` to the secret key for the same Cool Runnings project. Apply the fresh-project migrations, add the team's approved members and admins in Supabase, and allow the Cool Runnings `/auth/callback` URL in Supabase Auth. Configure `ROBOTEVENTS_API_TOKEN` in the new Vercel project for live competition data.

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

## Instagram updates and event gallery

The homepage and `/updates` show recent posts from the team account, [@the.vextagram](https://www.instagram.com/the.vextagram/) or [@coolrunningsvex](https://www.instagram.com/coolrunningsvex/) when an Instagram Login token is configured. Visitors can always follow the account link. Video posts link to Instagram for playback.

To connect the feed, have the owner of the professional Instagram account authorize a Meta app using Instagram Login and `instagram_business_basic`. Store its long-lived user access token as the server-only `INSTAGRAM_ACCESS_TOKEN` in Vercel, then redeploy. Renew the token before it expires and update the Vercel secret after renewal. [Meta Instagram Login documentation](https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login)

The event gallery is off by default. Set `GALLERY_ENABLED=true` in Vercel and redeploy to restore the archive, member gallery uploads, admin moderation, and the Worlds Live photo rotator. Remove the setting or set it to `false` and redeploy to close the gallery. Existing submissions remain in Supabase. Profile editing and profile photo uploads are available in either mode.

## Event gallery upload flow

Approved school email addresses are stored in the private Supabase table `private.team_site_members`. Only approved team members and gallery admins can use the protected upload and profile features.

Uploads go through this flow:

1. student signs in with Supabase magic link
2. approved uploader submits image, title, category, and date
3. the image is stored in a private Supabase Storage bucket
4. a `gallery_submissions` row is created with `status = 'pending'`
5. admin approves it
6. approved items appear in the event gallery and photos appear on the Worlds Live display

## Admin approval flow

Admin access is controlled by the `gallery_admins` table in Supabase.

Add an admin with:

```sql
insert into public.gallery_admins (email)
values ('your-email@isl.ch');
```

Then sign in and open `/admin` for roster management and, when enabled, gallery moderation.

## Supabase migrations

For a fresh project, apply all files in [supabase/migrations](supabase/migrations) in timestamp order. For a local Supabase stack, run `supabase init` once, then `supabase start` and `supabase db reset`. Use synthetic addresses for local testing.

The original Five Rings database was set up manually. For that existing database:

1. Check that the baseline objects are present and take a backup. After verifying the baseline, record version `20261112133901` as already applied in the linked project's migration history. Do not replay the baseline on the live database.
2. Configure `SUPABASE_SECRET_KEY` in Vercel as a server-only variable. Test the new build against a staging database. The preparation migration adds the new public views and private member table while the previous deployment is still live.
3. Apply the preparation migration and transfer the approved member addresses into `private.team_site_members` using the Supabase SQL editor or a trusted database connection. Use the existing list from a trusted local copy, and keep the addresses out of Git, tickets and logs. Gallery admins already listed in `public.gallery_admins` retain access. Check that all intended members are present, then build and deploy the new app against production so the public pages are generated with the new views.
4. Verify the new deployment serves profiles and approved photos. Apply the enforcement migration to make both buckets private and restrict direct access to the source tables.
5. Verify signed-out access to team pages and approved photos, a member magic link and upload, an admin preview and approval, and the denial of an old public URL for a pending photo. Review cached image URLs and older Vercel deployments that served the original public URLs.

Removing the allowlist from the working tree leaves it in older commits. Coordinate any history rewrite with ISL and other repository collaborators, and follow GitHub's guidance for removing cached references and handling forks and clones: [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Editing team data

Team profiles now live in Supabase through the protected member profile flow at `/profile`.

Fixtures and results fallback data live in:

- [`data/fixtures.json`](data/fixtures.json)
- [`data/results.json`](data/results.json)

## Project structure

- [`src/app/page.tsx`](src/app/page.tsx): homepage
- [`src/app/updates/page.tsx`](src/app/updates/page.tsx): Instagram updates
- [`src/app/gallery/page.tsx`](src/app/gallery/page.tsx): optional event gallery
- [`src/app/upload/page.tsx`](src/app/upload/page.tsx): protected student upload page
- [`src/app/profile/page.tsx`](src/app/profile/page.tsx): protected member profile page
- [`src/app/admin/page.tsx`](src/app/admin/page.tsx): admin hub
- [`src/app/admin/gallery/page.tsx`](src/app/admin/gallery/page.tsx): admin approval page
- [`src/app/admin/team/page.tsx`](src/app/admin/team/page.tsx): admin team profile management
- [`src/lib/gallery.ts`](src/lib/gallery.ts): approved gallery reader
- [`src/lib/gallerySubmissions.ts`](src/lib/gallerySubmissions.ts): pending submission insert helper
- [`src/lib/galleryAdmin.ts`](src/lib/galleryAdmin.ts): admin moderation data helper
- [`src/lib/teamProfiles.ts`](src/lib/teamProfiles.ts): team profile readers

## Notes

- The old blog feature has been removed.
- If uploads fail, check your Supabase bucket, RLS policies, and table migrations first.
