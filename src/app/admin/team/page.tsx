import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import Card from '@/components/Card';
import OptimizedPhotoInput from '@/components/OptimizedPhotoInput';
import { getAdminAccess } from '@/lib/adminAccess';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TEAM_PROFILE_ROLE_OPTIONS } from '@/lib/teamProfileConstants';
import { getAllTeamProfilesForAdmin } from '@/lib/teamProfiles';
import { deleteTeamProfileAsAdmin, updateTeamProfileAsAdmin } from './actions';

export default async function AdminTeamPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-5xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Admin Setup Pending</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Supabase environment variables are not configured yet, so the team admin workflow cannot be used.
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
    redirect('/login?next=/admin/team');
  }

  const access = await getAdminAccess(user.email);

  if (!access.isAdmin) {
    return (
      <section className="mx-auto max-w-4xl py-8">
        <Card className="space-y-5">
          <div>
            <p className="eyebrow">Team Admin</p>
            <h1 className="heading-display mt-4 text-4xl font-black text-white">Admin Access Required</h1>
            <p className="mt-4 text-lg text-[var(--color-muted)]">
              This route is reserved for gallery admins. Add your email to the `gallery_admins` table in Supabase to manage team profiles here.
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

  const profiles = await getAllTeamProfilesForAdmin();

  return (
    <AdminShell
      activeSection="team"
      title="Manage Team Profiles"
      description="Edit member bios, replace photos, move alumni into the Hall of Fame, or remove profiles that should no longer appear on the site."
      userEmail={user.email}
    >
      {profiles.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-white">No team profiles yet.</p>
          <p className="mt-3 text-[var(--color-muted)]">
            Profiles will appear here once team members save them through the member hub.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5">
          {profiles.map((profile) => (
            <Card key={profile.id} className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20">
                    {profile.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
                        alt={profile.name}
                        width={640}
                        height={480}
                        sizes="(min-width: 1024px) 260px, 100vw"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted)]">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Member Email</p>
                    <p className="mt-2 break-all text-sm font-semibold text-white">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <form action={updateTeamProfileAsAdmin} className="space-y-4">
                    <input type="hidden" name="email" value={profile.email} />
                    <input type="hidden" name="ownerKey" value={profile.ownerKey} />
                    <input type="hidden" name="currentPhotoPath" value={profile.photoPath ?? ''} />

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Name</span>
                        <input
                          type="text"
                          name="name"
                          defaultValue={profile.name}
                          maxLength={120}
                          className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Replace Photo</span>
                        <OptimizedPhotoInput
                          name="photo"
                          maxDimension={1200}
                          className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white"
                        />
                      </label>
                    </div>

                    <fieldset className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <legend className="px-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Roles</legend>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {TEAM_PROFILE_ROLE_OPTIONS.map((role) => (
                          <label key={`${profile.id}-${role}`} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-black/15 px-3 py-3 text-sm text-white">
                            <input
                              type="checkbox"
                              name="roles"
                              value={role}
                              defaultChecked={profile.roles.includes(role)}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-red-500"
                            />
                            <span>{role}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <label className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Bio</span>
                      <textarea
                        name="bio"
                        rows={5}
                        maxLength={1200}
                        defaultValue={profile.bio}
                        className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                        required
                      />
                    </label>

                    <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                      <input
                        type="checkbox"
                        name="isCurrentMember"
                        defaultChecked={profile.isCurrentMember}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-red-500"
                      />
                      <span>
                        <span className="block text-sm font-bold text-white">Current member</span>
                        <span className="mt-1 block text-sm text-[var(--color-muted)]">
                          Untick this to move the member into the public Hall of Fame section.
                        </span>
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>

                  <form action={deleteTeamProfileAsAdmin}>
                    <input type="hidden" name="email" value={profile.email} />
                    <input type="hidden" name="photoPath" value={profile.photoPath ?? ''} />
                    <button type="submit" className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20">
                      Remove Profile
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
