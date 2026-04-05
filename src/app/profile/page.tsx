import { redirect } from 'next/navigation';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTeamProfileByEmail } from '@/lib/teamProfiles';
import { getUploadAccess } from '@/lib/uploadAccess';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-3xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Profile Setup Pending</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Supabase environment variables are not configured yet, so member profiles cannot be used. Add the auth env vars first, then return here.
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
    redirect('/login?next=/profile');
  }

  const access = getUploadAccess(user.email);
  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    redirect('/login?error=not_allowed');
  }

  const [profile, adminAccess] = await Promise.all([
    getTeamProfileByEmail(user.email),
    getAdminAccess(user.email),
  ]);

  return <ProfileForm userEmail={user.email} profile={profile} isAdmin={adminAccess.isAdmin} />;
}
