# 21052A Robotics Team Website

A simple Next.js site for the Five Rings Robotics VEX robotics team (21052A) to track:
- home page information and news
- gallery photos
- upcoming fixtures
- past results
- team members
- basic blog posts

This repo is designed for students (beginner-friendly), with easy JSON data files and a minimal UI.

## 1. What this site is for

This site provides a team portal for:
- showing team name and mission
- listing next competitions, build sessions, and events
- displaying recent match results
- sharing team member profiles and values
- gallery images from build and competition activities
- team news posts

The site is built in Next.js, Tailwind CSS, and uses local JSON files as data sources.

## 2. Run locally

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open in browser:

`http://localhost:3000`

4. Run linter anytime:

```bash
npm run lint
```

## 3. Add a new team member

Team data lives at `data/team.json`.

Each member object should include:
- `name`
- `role`
- `photo` (path under `public/images/team` ideally)
- `shortBio`
- `responsibilities` (array of strings)
- `favouriteMoment`

Example:

```json
{
  "name": "Ava Martinez",
  "role": "Driver",
  "photo": "/images/team/ava.jpg",
  "shortBio": "Dedicated robotics driver and controls student.",
  "responsibilities": ["Practice robot driving", "Tune controls"],
  "favouriteMoment": "Winning our first regional match"
}
```

After editing, refresh `http://localhost:3000/team`.

## 4. Add a blog post

Blog posts are in `content/posts/` as markdown (`.md`).

Template file format:

```md
---
title: "Post title"
date: "2026-04-01"
summary: "Short summary text"
slug: "post-slug"
---

Post content goes here in markdown.
```

Save file and open `http://localhost:3000/blog`.

## 5. Add gallery images

Gallery items come from `data/gallery.json` and files in `public/images/gallery/`.

Add a JSON item:

```json
{
  "id": 9,
  "image": "/images/gallery/new-photo.jpg",
  "title": "Practice tower climb",
  "category": "Build Season",
  "date": "2026-04-10"
}
```

Put the actual image at `public/images/gallery/new-photo.jpg`.

Refresh `http://localhost:3000/gallery`.

## 6. Update fixtures and results manually

Fixtures: `data/fixtures.json` contains upcoming events.

Example entry:

```json
{
  "id": 4,
  "eventName": "District Championship",
  "location": "City Arena",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "season": "2026",
  "link": "https://example.com/fixtures/district"
}
```

Results: `data/results.json` contains previous event results.

Example entry:

```json
{
  "id": 4,
  "eventName": "District Championship",
  "date": "2026-06-03",
  "placement": "1st Place",
  "awards": "Excellence Award",
  "link": "https://example.com/results/district"
}
```

Refresh appropriate pages after editing.

## 7. RobotEvents API integration (future)

This project currently uses local JSON files for fixtures and results. The planned endpoint scaffolding is:
- `src/app/api/robotevents/route.ts` (server API route placeholder)
- `src/lib/robotevents.ts` (data mapping + fetching utility)

Once API access is available:
1. Set environment variables in `.env`:
   - `ROBOTEVENTS_API_KEY=your-token`
   - `ROBOTEVENTS_BASE_URL=https://www.robotevents.com/api`
2. Implement real fetch logic in `src/lib/robotevents.ts`
3. Consume those functions in `src/app/api/robotevents/route.ts` or directly in pages.
4. Optionally replace local files with API responses, or use local files as fallback if API is unavailable.

## 8. Project structure quick reference

- `src/app/page.tsx` – home page
- `src/app/gallery/page.tsx` – gallery
- `src/app/fixtures/page.tsx` – fixtures
- `src/app/results/page.tsx` – results
- `src/app/team/page.tsx` – team roster
- `data/*.json` – local data sources (team, fixtures, results, gallery)
- `content/posts` – blog markdown files
- `src/components` – reusable UI components

---

### Notes for non-experts

- No backend server is needed beyond Next.js dev server.
- Editing a JSON file and saving is enough; the page loads updated data immediately.
- If random style issues appear, run `npm run lint` then restart dev server.
