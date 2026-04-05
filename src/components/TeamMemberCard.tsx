'use client';

import Image from 'next/image';
import { useState } from 'react';
import Card from "./Card";
import type { TeamProfileRole } from '@/lib/teamProfileConstants';

type TeamMember = {
  name: string;
  roles: TeamProfileRole[];
  photo: string;
  shortBio: string;
  isCurrentMember?: boolean;
};

export default function TeamMemberCard({ member }: { member: TeamMember }) {
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23f1f5f9'/%3E%3Ctext x='50%' y='50%' fill='%231e293b' font-size='20' font-family='Inter, system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
  const [imageSrc, setImageSrc] = useState(member.photo || fallback);
  const primaryRole = member.roles[0] || 'Role not set';

  return (
    <Card className={member.isCurrentMember ? 'border-red-500/20 bg-[linear-gradient(180deg,rgba(19,34,56,0.96),rgba(12,22,38,0.96))]' : ''}>
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
            {primaryRole}
          </span>
        </div>
        <p className="text-[var(--color-muted)] mt-2">{member.shortBio || 'No bio available.'}</p>
      </div>
      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-muted)]">Roles</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.roles.length > 0 ? (
            member.roles.map((role) => (
              <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                {role}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
              Role not set
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
