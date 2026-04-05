import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { getPendingGallerySubmissions } from '@/lib/galleryAdmin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllTeamProfilesForAdmin } from '@/lib/teamProfiles';

export default async function AdminOverviewPage() {
  if (!isSupabaseConfigured()) {
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

  const supabase = createSupabaseServerClient();
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
              This route is reserved for gallery admins. Add your email to the `gallery_admins` table in Supabase to use the admin tools here.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Signed In As</p>
            <p className="mt-3 text-base font-bold text-white">{user.email}</p>
          </div>
        </Card>
      </section>
    );
  }

  const [submissions, profiles] = await Promise.all([
    getPendingGallerySubmissions(),
    getAllTeamProfilesForAdmin(),
  ]);

  const currentMembers = profiles.filter((profile) => profile.isCurrentMember).length;
  const alumniMembers = profiles.filter((profile) => !profile.isCurrentMember).length;

  return (
    <AdminShell
      activeSection="overview"
      title="Admin Overview"
      description="Manage gallery approvals and team profiles from one place."
      userEmail={user.email}
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Pending Uploads</p>
          <p className="mt-3 text-4xl font-black text-white">{submissions.length}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Waiting for gallery approval</p>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Current Members</p>
          <p className="mt-3 text-4xl font-black text-white">{currentMembers}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Live on the public team page</p>
        </Card>
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Hall of Fame</p>
          <p className="mt-3 text-4xl font-black text-white">{alumniMembers}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Former members preserved on the site</p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-black text-white">Gallery Moderation</h2>
          <p className="mt-3 text-[var(--color-muted)]">
            Review student photo submissions and approve the ones that should appear on Highlights, the homepage, and the worlds display.
          </p>
          <a href="/admin/gallery" className="btn btn-primary mt-5 inline-flex">
            Open Gallery Admin
          </a>
        </Card>

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
