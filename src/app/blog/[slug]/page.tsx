import { getAllPosts, getPostBySlug } from '@/lib/posts';
import type { Metadata } from 'next';

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph, index) => (
    <p key={index} className="mt-4 text-[var(--color-muted)] leading-relaxed">
      {paragraph.split('\n').join(' ')}
    </p>
  ));
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);

  return {
    title: `${post.title} | 21052A Robotics Blog`,
    description: post.summary,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-[var(--color-muted)]">
        Post not found. Check that the slug exists in `content/posts`.
      </div>
    );
  }

  return (
    <article className="space-y-6">
      <header className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <p className="text-sm text-[var(--color-primary-accent)]">{post.date ? new Date(post.date).toLocaleDateString() : 'Date not available'}</p>
        <h1 className="mt-2 text-4xl font-bold text-[var(--color-text)]">{post.title || 'Untitled post'}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">By {post.author || 'Unknown author'}</p>
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title || 'Blog post image'}
            className="mt-6 h-64 w-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23111a30'/%3E%3Ctext x='50%' y='50%' fill='%23ffffff' font-size='20' font-family='Inter, system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        )}
      </header>
      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        {renderContent(post.content || 'No content available.')}
      </section>
    </article>
  );
}
