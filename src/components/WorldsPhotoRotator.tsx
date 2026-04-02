'use client';

import { useEffect, useState } from 'react';

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
    <section className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Latest Photos</p>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Team Highlights</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {photos.length} photos
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(8,16,29,0.55)]">
        <div className="aspect-[16/10] bg-[rgba(255,255,255,0.03)]">
          <img
            src={activePhoto?.image || placeholder}
            alt={activePhoto?.title || 'Team photo'}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-300">{activePhoto?.category || 'Team'}</p>
          <h3 className="mt-3 text-3xl font-black text-white">{activePhoto?.title || 'Latest team moment'}</h3>
          <p className="mt-3 text-lg text-[var(--color-muted)]">{formatDate(activePhoto?.date || '')}</p>
        </div>
      </div>

      {photos.length > 1 ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                index === activeIndex
                  ? 'border-red-400 bg-red-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-[var(--color-muted)] hover:text-white'
              }`}
            >
              {photo.title}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
