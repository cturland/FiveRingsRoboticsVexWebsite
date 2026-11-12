import Image from 'next/image';
import type { InstagramPost } from '@/lib/instagram';

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Europe/Zurich' });

export default function InstagramPosts({ posts }: { posts: InstagramPost[] }) {
  if (posts.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <a
            href={post.url}
            className="group block h-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[var(--color-surface)] transition hover:border-brand-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-300"
          >
            {post.image ? (
              <div className="relative aspect-square overflow-hidden bg-black/20">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <div className="space-y-2 p-4 sm:p-5">
              {post.date ? (
                <time dateTime={post.date} className="block text-xs text-[var(--color-muted)]">
                  {dateFormat.format(new Date(post.date))}
                </time>
              ) : null}
              {post.caption ? <p className="line-clamp-3 text-sm leading-relaxed text-white">{post.caption}</p> : null}
              <p className="text-sm font-semibold text-brand-300">{post.isVideo ? 'Watch on Instagram' : 'View on Instagram'}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
