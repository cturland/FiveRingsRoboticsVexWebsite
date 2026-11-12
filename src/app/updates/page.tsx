import type { Metadata } from 'next';
import Link from 'next/link';
import InstagramPosts from '@/components/InstagramPosts';
import { galleryEnabled } from '@/lib/galleryFeature';
import { getInstagramPosts, instagram } from '@/lib/instagram';

export const metadata: Metadata = {
  title: 'Updates | Five Rings Robotics',
  description: 'Follow Five Rings Robotics for competition highlights, robot builds, and team news.',
};

export const revalidate = 900;

export default async function UpdatesPage() {
  const posts = await getInstagramPosts();

  return (
    <section className="space-y-6">
      <header className="rounded-[1.7rem] border border-red-500/20 bg-[linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] p-6 sm:p-8">
        <h1 className="heading-display text-3xl font-black text-white sm:text-4xl">Team Updates</h1>
        <p className="mt-3 max-w-xl text-[var(--color-muted)]">
          See what Five Rings Robotics is building and follow the team on competition days.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={instagram.url} className="btn btn-primary">Follow @{instagram.handle}</a>
          {galleryEnabled ? <Link href="/gallery" className="btn btn-secondary">Event Gallery</Link> : null}
        </div>
      </header>

      {posts.length > 0 ? (
        <section aria-labelledby="instagram-posts">
          <h2 id="instagram-posts" className="mb-4 text-xl font-bold text-white">Latest on Instagram</h2>
          <InstagramPosts posts={posts} />
        </section>
      ) : null}
    </section>
  );
}
