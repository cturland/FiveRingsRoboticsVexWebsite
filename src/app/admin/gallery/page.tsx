import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { getPendingGallerySubmissions } from '@/lib/galleryAdmin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { approveGallerySubmission } from './actions';

function formatDate(value: string) {
  if (!value) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  if (!value) {
    return 'Created time unavailable';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Zurich',
    timeZoneName: 'short',
  }).format(new Date(value));
}

export default async function AdminGalleryPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="mx-auto max-w-5xl py-8">
        <Card>
          <h1 className="heading-display text-3xl font-black text-white">Admin Setup Pending</h1>
          <p className="mt-4 text-[var(--color-muted)]">
            Supabase environment variables are not configured yet, so the gallery admin workflow cannot be used.
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
    redirect('/login?next=/admin/gallery');
  }

  const access = await getAdminAccess(user.email);

  if (!access.isAdmin) {
    return (
      <section className="mx-auto max-w-4xl py-8">
        <Card className="space-y-5">
          <div>
            <p className="eyebrow">Gallery Admin</p>
            <h1 className="heading-display mt-4 text-4xl font-black text-white">Admin Access Required</h1>
            <p className="mt-4 text-lg text-[var(--color-muted)]">
              This route is reserved for gallery admins. Add your email to the `gallery_admins` table in Supabase to review pending submissions here.
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

  const submissions = await getPendingGallerySubmissions();

  return (
    <AdminShell
      activeSection="gallery"
      title="Pending Update Submissions"
      description="Review student photos and YouTube links before they appear on Updates, the homepage preview, and the worlds display."
      userEmail={user.email}
    >
      {submissions.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-white">No pending submissions right now.</p>
          <p className="mt-3 text-[var(--color-muted)]">
            New uploads will appear here once students submit them.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5">
          {submissions.map((submission) => (
            <Card key={submission.id} className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20">
                {submission.mediaType === 'youtube' ? (
                  <iframe
                    src={submission.youtubeEmbedUrl}
                    title={submission.title}
                    className="h-72 w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <Image
                    src={submission.imageUrl}
                    alt={submission.title}
                    width={640}
                    height={480}
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="h-72 w-full object-cover"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-yellow-200">
                    Pending
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white">
                    {submission.mediaType === 'youtube' ? 'YouTube' : 'Photo'}
                  </span>
                  <span className="text-sm text-[var(--color-muted)]">Submitted {formatDateTime(submission.createdAt)}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">{submission.title}</h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-300">{submission.category}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Uploader</p>
                    <p className="mt-2 break-all text-sm font-semibold text-white">{submission.email}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Update Date</p>
                    <p className="mt-2 text-sm font-semibold text-white">{formatDate(submission.date)}</p>
                  </div>
                </div>

                {submission.mediaType === 'youtube' ? (
                  <a
                    href={submission.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-bold text-red-300 hover:text-red-200"
                  >
                    Open video on YouTube
                  </a>
                ) : null}

                <form action={approveGallerySubmission}>
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <button type="submit" className="btn btn-primary w-full sm:w-auto">
                    Approve Submission
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
