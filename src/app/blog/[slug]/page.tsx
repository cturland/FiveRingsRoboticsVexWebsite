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
    title: `${post.title} | VEX Robotics Blog`,
    description: post.summary,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return (
    <article className="space-y-6">
      <header className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <p className="text-sm text-[var(--color-primary-accent)]">{new Date(post.date).toLocaleDateString()}</p>
        <h1 className="mt-2 text-4xl font-bold text-white">{post.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">By {post.author}</p>
        {post.coverImage && <img src={post.coverImage} alt={post.title} className="mt-6 h-64 w-full object-cover rounded-lg" />}
      </header>
      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        {renderContent(post.content)}
      </section>
    </article>
  );
}
