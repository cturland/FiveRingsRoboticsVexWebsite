import { galleryEnabled } from '@/lib/galleryFeature';
import { redirect } from 'next/navigation';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { isRosterConfigured } from '@/lib/supabase/rosterReady';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTeamProfileByEmail } from '@/lib/teamProfiles';
import { getUploadAccess } from '@/lib/uploadAccess';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  if (!isRosterConfigured()) {
    return (
      <section className="mx-auto max-w-3xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Member profiles</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Member sign-in is not available yet. Contact your team adviser for roster changes.
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
    redirect('/login?next=/profile');
  }

  const access = await getUploadAccess(supabase, user.email);
  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    redirect('/login?error=not_allowed');
  }

  const [profile, adminAccess] = await Promise.all([
    getTeamProfileByEmail(user.email),
    getAdminAccess(user.email),
  ]);

  return <ProfileForm userEmail={user.email} profile={profile} isAdmin={adminAccess.isAdmin} galleryEnabled={galleryEnabled} />;
}
