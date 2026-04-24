'use client';

import { useEffect, useState } from 'react';
import PreviewImage from '@/components/PreviewImage';

type PhotoItem = {
  id: number;
  image: string;
  title: string;
  category: string;
  date: string;
};

type WorldsPhotoRotatorProps = {
  photos: PhotoItem[];
  placeholder: string;
};

function formatDate(value: string) {
  if (!value) {
    return 'Latest team photo';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function WorldsPhotoRotator({ photos, placeholder }: WorldsPhotoRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  const activePhoto = photos[activeIndex];

  return (
    <section className="flex min-h-0 flex-col rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Latest Updates</p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Team Photos</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {photos.length} photos
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-[rgba(8,16,29,0.55)]">
        <div className="relative min-h-0 flex-1 bg-[rgba(255,255,255,0.03)]">
          <PreviewImage
            src={activePhoto?.image || placeholder}
            alt={activePhoto?.title || 'Team photo'}
            fill
            sizes="(min-width: 1280px) 45vw, 100vw"
            className="object-cover"
            unoptimized={!activePhoto?.image || (activePhoto.image || '').startsWith('data:')}
          />
        </div>
        <div className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300 xl:text-sm">{activePhoto?.category || 'Team'}</p>
          <h3 className="mt-2 text-2xl font-black text-white xl:text-3xl">{activePhoto?.title || 'Latest team moment'}</h3>
          <p className="mt-2 text-base text-[var(--color-muted)] xl:text-lg">{formatDate(activePhoto?.date || '')}</p>
        </div>
      </div>

      {photos.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}: ${photo.title}`}
              className={`h-3 w-8 rounded-full border transition-colors ${
                index === activeIndex
                  ? 'border-red-400 bg-red-400'
                  : 'border-white/10 bg-white/10 hover:bg-white/20'
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
