'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import SectionHeading from '../../components/SectionHeading';
import Card from '../../components/Card';
import type { PublicGalleryItem } from '@/lib/gallery.types';

const instagramAccount = {
  handle: 'the.vextagram',
  name: 'The Vextagram',
  url: 'https://www.instagram.com/the.vextagram/',
  blurb: 'Follow match-day highlights, pit photos, robot reveals, and behind-the-scenes snapshots from the team on The Vextagram.',
};

type ActiveImage = {
  src: string;
  title: string;
  category: string;
  date: string;
};

type GalleryClientProps = {
  images: PublicGalleryItem[];
};

export default function GalleryClient({ images }: GalleryClientProps) {
  const categories = useMemo(() => {
    const derivedCategories = Array.from(
      new Set(
        images
          .map((item) => item.category)
          .filter(Boolean),
      ),
    );

    return ['All', ...derivedCategories];
  }, [images]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);

  const filteredImages = useMemo(() => {
    return activeCategory === 'All' ? images : images.filter((item) => item.category === activeCategory);
  }, [activeCategory, images]);

  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23111a30'/%3E%3Ctext x='50%' y='50%' fill='%23ffffff' font-size='20' font-family='Inter, system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <section className="space-y-6">
      <SectionHeading title="Highlights" subtitle="Photos and updates from the team" />

      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(16,29,47,0.92),rgba(9,18,31,0.9))] px-5 py-4 sm:px-6 sm:py-5">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f9ce34_0%,#ee2a7b_50%,#6228d7_100%)] text-sm font-black text-white">
                IG
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">Instagram</p>
                <p className="text-sm font-bold text-white">@{instagramAccount.handle}</p>
              </div>
            </div>
            <p className="hidden text-sm text-[var(--color-muted)] md:block">{instagramAccount.blurb}</p>
          </div>

          <div>
            <a
              href={instagramAccount.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary min-w-[200px]"
            >
              Visit @{instagramAccount.handle}
            </a>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`btn btn-secondary ${activeCategory === category ? 'bg-[var(--color-primary-accent)] text-black' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-muted)]">
          No images found for {activeCategory}. Upload a photo or choose a different category.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((item) => {
            const showTitle = item.title || 'Untitled image';
            const showDate = item.date || 'Date not available';
            const showCategory = item.category || 'Uncategorized';
            const src = item.image || placeholder;

            return (
              <button
                key={item.id ?? `${showTitle}-${showDate}`}
                type="button"
                onClick={() =>
                  setActiveImage({
                    src,
                    title: showTitle,
                    category: showCategory,
                    date: showDate,
                  })
                }
                className="text-left"
              >
                <Card className="overflow-hidden p-0">
                  <div className="relative h-48 w-full overflow-hidden bg-[var(--color-surface-alt)]">
                    <Image
                      src={src}
                      alt={showTitle}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      unoptimized={src.startsWith('data:')}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary-accent)]">{showCategory}</p>
                    <h3 className="mt-1 text-lg font-bold text-[var(--color-text)]">{showTitle}</h3>
                    <p className="mt-1 text-[var(--color-muted)]">{showDate}</p>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-surface)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary-accent)]">{activeImage.category}</p>
                <h3 className="mt-1 text-2xl font-bold text-white">{activeImage.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{activeImage.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative bg-black">
              <Image
                src={activeImage.src}
                alt={activeImage.title}
                width={1600}
                height={1200}
                sizes="100vw"
                className="max-h-[80vh] w-full object-contain"
                unoptimized={activeImage.src.startsWith('data:')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
