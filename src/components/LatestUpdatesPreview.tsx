'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PublicGalleryItem } from '@/lib/gallery.types';

type ActiveUpdate = {
  mediaType: 'image' | 'youtube';
  src: string;
  embedUrl: string;
  title: string;
  category: string;
  date: string;
};

type LatestUpdatesPreviewProps = {
  items: PublicGalleryItem[];
};

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

export default function LatestUpdatesPreview({ items }: LatestUpdatesPreviewProps) {
  const [activeUpdate, setActiveUpdate] = useState<ActiveUpdate | null>(null);

  if (items.length === 0) {
    return (
      <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 text-[var(--color-muted)] md:col-span-3">
        No approved updates yet. Once submissions are approved, they will appear here automatically.
      </article>
    );
  }

  return (
    <>
      {items.map((item) => {
        const title = item.title || 'Untitled update';
        const category = item.category || 'Update';
        const date = formatDate(item.date);
        const isYouTube = item.mediaType === 'youtube';
        const src = isYouTube ? item.youtubeThumbnailUrl : item.image || '/images/gallery/robot.jpg';

        return (
          <button
            key={item.id ?? title}
            type="button"
            onClick={() =>
              setActiveUpdate({
                mediaType: item.mediaType,
                src,
                embedUrl: item.youtubeEmbedUrl,
                title,
                category,
                date,
              })
            }
            className="text-left"
          >
            <article className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] transition hover:border-red-400/35">
              <div className="relative aspect-[4/3] overflow-hidden">
                {isYouTube ? (
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 hover:scale-105"
                    style={{ backgroundImage: `url(${src})` }}
                  >
                    <div className="flex h-full w-full items-center justify-center bg-black/20">
                      <span className="rounded-full border border-white/20 bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">
                        Play
                      </span>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt={title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="w-fit rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white">
                    {category}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{date}</p>
              </div>
            </article>
          </button>
        );
      })}

      {activeUpdate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setActiveUpdate(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-surface)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary-accent)]">{activeUpdate.category}</p>
                <h3 className="mt-1 text-2xl font-bold text-white">{activeUpdate.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{activeUpdate.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveUpdate(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative bg-black">
              {activeUpdate.mediaType === 'youtube' ? (
                <iframe
                  src={activeUpdate.embedUrl}
                  title={activeUpdate.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={activeUpdate.src}
                  alt={activeUpdate.title}
                  width={1600}
                  height={1200}
                  sizes="100vw"
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
