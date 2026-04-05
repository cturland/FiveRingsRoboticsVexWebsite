import { redirect } from 'next/navigation';
import Card from '@/components/Card';
import { getUploadAccess } from '@/lib/uploadAccess';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import UploadForm from './UploadForm';

export default async function UploadPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-3xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Upload Setup Pending</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Supabase environment variables are not configured yet, so sign-in cannot be tested. Add the auth env vars first, then return here.
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
    redirect('/login?next=/upload');
  }

  const access = getUploadAccess(user.email);

  if (!access.isSchoolEmail || !access.isAllowedUploader) {
    redirect('/login?error=not_allowed');
  }

  return <UploadForm userEmail={user.email} />;
}
