import { galleryEnabled } from '@/lib/galleryFeature';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { getPendingGallerySubmissions } from '@/lib/galleryAdmin';
import { isRosterConfigured } from '@/lib/supabase/rosterReady';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllTeamProfilesForAdmin } from '@/lib/teamProfiles';

export default async function AdminOverviewPage() {
  if (!isRosterConfigured()) {
    return (
      <section className="mx-auto max-w-5xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Admin Setup Pending</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Supabase environment variables are not configured yet, so the admin workflow cannot be used.
          </p>
        </Card>
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/login?next=/admin');
  }

  const access = await getAdminAccess(user.email);

  if (!access.isAdmin) {
    return (
      <section className="mx-auto max-w-4xl py-8">
        <Card className="space-y-5">
          <div>
            <p className="eyebrow">Admin Hub</p>
            <h1 className="heading-display mt-4 text-4xl font-black text-white">Admin Access Required</h1>
            <p className="mt-4 text-lg text-[var(--color-muted)]">
              This page is reserved for team admins. Contact your team adviser if you need access.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Signed In As</p>
            <p className="mt-3 text-base font-bold text-white">{user.email}</p>
          </div>
        </Card>
      </section>
    );
  }

  const showGallery = galleryEnabled && access.canModerateGallery;
  const [submissions, profiles] = await Promise.all([
    showGallery ? getPendingGallerySubmissions() : [],
    getAllTeamProfilesForAdmin(),
  ]);

  const currentMembers = profiles.filter((profile) => profile.isCurrentMember).length;
  const alumniMembers = profiles.filter((profile) => !profile.isCurrentMember).length;

  return (
    <AdminShell
      activeSection="overview"
      title="Admin Overview"
      description={showGallery ? 'Manage team profiles and event gallery submissions.' : 'Manage team profiles and roster photos.'}
      userEmail={user.email}
      showGallery={showGallery}
    >
      <div className={'grid gap-5 ' + (showGallery ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {showGallery ? (
          <Card>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Pending Uploads</p>
            <p className="mt-3 text-4xl font-black text-white">{submissions.length}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Waiting for gallery approval</p>
          </Card>
        ) : null}
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Current Members</p>
          <p className="mt-3 text-4xl font-black text-white">{currentMembers}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Live on the public team page</p>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Hall of Fame</p>
          <p className="mt-3 text-4xl font-black text-white">{alumniMembers}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Former members preserved on the site</p>
        </Card>
      </div>

      <div className={'mt-5 grid gap-5 ' + (showGallery ? 'lg:grid-cols-2' : '')}>
        {showGallery ? (
          <Card>
            <h2 className="text-2xl font-black text-white">Gallery Moderation</h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Review student photo and video submissions and approve the ones that should appear in the event gallery and on the Worlds Live display.
            </p>
            <a href="/admin/gallery" className="btn btn-primary mt-5 inline-flex">
              Open Gallery Admin
            </a>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-2xl font-black text-white">Team Profiles</h2>
          <p className="mt-3 text-[var(--color-muted)]">
            Edit member bios, update roles, replace profile photos, or remove old records from the public team page.
          </p>
          <a href="/admin/team" className="btn btn-primary mt-5 inline-flex">
            Open Team Admin
          </a>
        </Card>
      </div>
    </AdminShell>
  );
}
