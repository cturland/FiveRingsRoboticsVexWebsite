'use client';

import Link from 'next/link';
import { getAllPosts, Post } from '@/lib/posts';
import SectionHeading from '@/components/SectionHeading';

export default function BlogPage() {
  const posts = getAllPosts();

  const postsList = Array.isArray(posts) ? posts : [];
  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23111a30'/%3E%3Ctext x='50%' y='50%' fill='%23ffffff' font-size='20' font-family='Inter, system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <section className="space-y-6">
      <SectionHeading title="Team Blog" subtitle="Latest updates from the build season, match reviews, and engineering breakthroughs." />

      {postsList.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-muted)]">
          No blog posts yet. Add content to `content/posts`.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {postsList.map((post: Post) => (
            <article key={post.slug ?? post.title} className="card p-5">
              <img
                src={post.coverImage || placeholder}
                alt={post.title || 'Blog post'}
                className="h-40 w-full rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== placeholder) target.src = placeholder;
                }}
              />
              <div className="mt-4">
                <p className="text-sm text-[var(--color-primary-accent)]">{post.date ? new Date(post.date).toLocaleDateString() : 'Date unavailable'}</p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{post.title || 'Untitled post'}</h2>
                <p className="mt-2 text-[var(--color-muted)]">{post.summary || 'No summary set.'}</p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">By {post.author || 'Unknown author'}</p>
                <Link
                  href={post.slug ? `/blog/${post.slug}` : '#'}
                  className="mt-4 inline-block font-medium text-[var(--color-primary-accent)]"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
