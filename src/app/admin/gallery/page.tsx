import Image from 'next/image';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import Card from '@/components/Card';
import { getAdminAccess } from '@/lib/adminAccess';
import { getAllGallerySubmissionsForAdmin } from '@/lib/galleryAdmin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { deleteGallerySubmissionAsAdmin, setGallerySubmissionStatus, updateGallerySubmissionAsAdmin } from './actions';

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

function getStatusClasses(status: string) {
  if (status === 'approved') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  }

  if (status === 'rejected') {
    return 'border-red-400/20 bg-red-400/10 text-red-200';
  }

  return 'border-yellow-400/20 bg-yellow-400/10 text-yellow-200';
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

  const submissions = await getAllGallerySubmissionsForAdmin();
  const pendingCount = submissions.filter((submission) => submission.status === 'pending').length;
  const approvedCount = submissions.filter((submission) => submission.status === 'approved').length;
  const rejectedCount = submissions.filter((submission) => submission.status === 'rejected').length;

  return (
    <AdminShell
      activeSection="gallery"
      title="Update Post Management"
      description="Edit, approve, reject, and delete student photo and video updates before or after they appear publicly."
      userEmail={user.email}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-200">Pending</p>
          <p className="text-3xl font-black text-white">{pendingCount}</p>
          <p className="text-sm text-[var(--color-muted)]">Waiting for admin review.</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Approved</p>
          <p className="text-3xl font-black text-white">{approvedCount}</p>
          <p className="text-sm text-[var(--color-muted)]">Visible on public update surfaces.</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">Rejected</p>
          <p className="text-3xl font-black text-white">{rejectedCount}</p>
          <p className="text-sm text-[var(--color-muted)]">Held back from public pages.</p>
        </Card>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-white">No submissions yet.</p>
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

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${getStatusClasses(submission.status)}`}>
                    {submission.status}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white">
                    {submission.mediaType === 'youtube' ? 'YouTube' : 'Photo'}
                  </span>
                  <span className="text-sm text-[var(--color-muted)]">Submitted {formatDateTime(submission.createdAt)}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Uploader</p>
                    <p className="mt-2 break-all text-sm font-semibold text-white">{submission.email}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Current Update Date</p>
                    <p className="mt-2 text-sm font-semibold text-white">{formatDate(submission.date)}</p>
                  </div>
                </div>

                <form action={updateGallerySubmissionAsAdmin} className="grid gap-4">
                  <input type="hidden" name="submissionId" value={submission.id} />
                  <input type="hidden" name="mediaType" value={submission.mediaType} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-white">
                      Title
                      <input
                        type="text"
                        name="title"
                        defaultValue={submission.title}
                        required
                        className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-400/50"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-white">
                      Category
                      <input
                        type="text"
                        name="category"
                        defaultValue={submission.category}
                        required
                        className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-400/50"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-white">
                      Date
                      <input
                        type="date"
                        name="date"
                        defaultValue={submission.date}
                        required
                        className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-400/50"
                      />
                    </label>

                    {submission.mediaType === 'youtube' ? (
                      <label className="grid gap-2 text-sm font-semibold text-white">
                        YouTube Link
                        <input
                          type="url"
                          name="youtubeUrl"
                          defaultValue={submission.youtubeUrl}
                          required
                          className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-red-400/50"
                        />
                      </label>
                    ) : (
                      <div className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--color-muted)]">
                        Image replacement is not part of this admin form yet, but the post details can be edited and the post can be approved, rejected, or deleted.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="btn btn-secondary">
                      Save Changes
                    </button>
                  </div>
                </form>

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

                <div className="flex flex-wrap gap-3">
                  <form action={setGallerySubmissionStatus}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" className="btn btn-primary">
                      Approve
                    </button>
                  </form>

                  <form action={setGallerySubmissionStatus}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" className="btn btn-secondary">
                      Reject
                    </button>
                  </form>

                  <form action={setGallerySubmissionStatus}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <input type="hidden" name="status" value="pending" />
                    <button type="submit" className="btn btn-secondary">
                      Mark Pending
                    </button>
                  </form>

                  <form action={deleteGallerySubmissionAsAdmin}>
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <input type="hidden" name="imagePath" value={submission.imagePath ?? ''} />
                    <button type="submit" className="btn border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20">
                      Delete
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
