'use client';

import Image from 'next/image';
import { useState } from 'react';
import Card from "./Card";

type TeamMember = {
  name: string;
  role: string;
  photo: string;
  shortBio: string;
  responsibilities: string[];
  favouriteMoment: string;
};

export default function TeamMemberCard({ member }: { member: TeamMember }) {
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23f1f5f9'/%3E%3Ctext x='50%' y='50%' fill='%231e293b' font-size='20' font-family='Inter, system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
  const [imageSrc, setImageSrc] = useState(member.photo || fallback);

  return (
    <Card>
      <div className="relative h-48 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <Image
          src={imageSrc}
          alt={`${member.name || 'Team member'} photo`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover"
          unoptimized={imageSrc.startsWith('data:')}
          onError={() => {
            if (imageSrc !== fallback) {
              setImageSrc(fallback);
            }
          }}
        />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-x-2">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{member.name || 'Unknown Member'}</h2>
          <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
            {member.role || 'Role not set'}
          </span>
        </div>
        <p className="text-[var(--color-muted)] mt-2">{member.shortBio || 'No bio available.'}</p>
      </div>
      <div className="mt-4 text-sm text-[var(--color-muted)]">
        <p className="font-medium text-[var(--color-text)]">Responsibilities</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          {(member.responsibilities || ['No responsibilities set']).map((task, index) => (
            <li key={`${task}-${index}`}>{task}</li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-text)]">Favourite moment:</span> {member.favouriteMoment || 'No moment recorded.'}
      </p>
    </Card>
  );
}
