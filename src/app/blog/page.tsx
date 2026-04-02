import Link from 'next/link';
import { getAllPosts, Post } from '@/lib/posts';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <h1 className="text-3xl font-bold">Team Blog</h1>
        <p className="mt-2 text-[var(--color-muted)]">Latest updates from the build season, match reviews, and engineering breakthroughs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post: Post) => (
          <article key={post.slug} className="card p-5">
            <img src={post.coverImage} alt={post.title} className="h-40 w-full rounded-lg object-cover" />
            <div className="mt-4">
              <p className="text-sm text-[var(--color-primary-accent)]">{new Date(post.date).toLocaleDateString()}</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{post.title}</h2>
              <p className="mt-2 text-[var(--color-muted)]">{post.summary}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">By {post.author}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block font-medium text-[var(--color-primary-accent)]"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
