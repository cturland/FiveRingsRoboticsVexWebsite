'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Card from '@/components/Card';
import { TEAM_PROFILE_ROLE_OPTIONS } from '@/lib/teamProfileConstants';
import type { TeamProfileRecord } from '@/lib/teamProfiles';
import { saveTeamProfile, type TeamProfileFormState } from './actions';

const initialState: TeamProfileFormState = {
  status: 'idle',
  message: '',
};

type ProfileFormProps = {
  userEmail: string;
  profile: TeamProfileRecord | null;
  isAdmin: boolean;
};

export default function ProfileForm({ userEmail, profile, isAdmin }: ProfileFormProps) {
  const [state, formAction] = useFormState(saveTeamProfile, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const existingPhoto = profile?.photoUrl ?? null;
  const bioDefault = profile?.bio ?? '';
  const [bioValue, setBioValue] = useState(bioDefault);

  useEffect(() => {
    setBioValue(bioDefault);
  }, [bioDefault]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const wordCount = useMemo(() => {
    const normalized = bioValue.trim();
    return normalized ? normalized.split(/\s+/).length : 0;
  }, [bioValue]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl(null);
      setSelectedFileName('');
      return;
    }

    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayPhoto = previewUrl || existingPhoto;

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-8">
      <Card className="space-y-6 overflow-hidden p-0">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,89,100,0.18),transparent_32%),linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] px-5 py-6 sm:px-7">
          <p className="eyebrow">Member Hub</p>
          <h1 className="heading-display mt-4 text-3xl font-black text-white sm:text-4xl">Edit Your Team Profile</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            Add your name, roles, photo, and short bio so the team page can feature current members and celebrate alumni in the Hall of Fame later.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Signed In As</p>
              <p className="mt-2 break-all text-sm font-bold text-white sm:text-base">{userEmail}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Profile Status</p>
              <p className="mt-2 text-sm font-bold text-white sm:text-base">{profile ? 'Existing profile found' : 'No profile saved yet'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 pb-5 sm:px-7 sm:pb-7">
          {state.status !== 'idle' ? (
            <div
              className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
                state.status === 'success'
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                  : 'border-red-400/30 bg-red-400/10 text-red-100'
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/upload" className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
              Upload a Highlight
            </Link>
            <Link href="/gallery" className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
              View Highlights
            </Link>
            <Link href="/admin/gallery" className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
              {isAdmin ? 'Open Admin Review' : 'Admin Review Page'}
            </Link>
          </div>

          {isAdmin ? (
            <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              Admin shortcut:
              {' '}
              <Link href="/admin/team" className="font-bold text-white underline decoration-red-400/70 underline-offset-4">
                manage all team profiles
              </Link>
              .
            </div>
          ) : null}

          <form action={formAction} className="space-y-6">
            <input type="hidden" name="currentPhotoPath" value={profile?.photoPath ?? ''} />

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Name</span>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile?.name ?? ''}
                    maxLength={120}
                    placeholder="Your full name"
                    className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Profile Photo</span>
                  <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/5 p-3">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white"
                    />
                    <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
                      Upload a headshot or team photo. Images up to 5 MB are accepted.
                    </p>
                    {selectedFileName ? (
                      <p className="mt-2 text-xs font-semibold text-white/90">{selectedFileName}</p>
                    ) : null}
                  </div>
                </label>

                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-3">
                  {displayPhoto ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem]">
                      <Image
                        src={displayPhoto}
                        alt="Member profile preview"
                        fill
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover"
                        unoptimized={displayPhoto.startsWith('data:')}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-sm text-[var(--color-muted)]">
                      No photo selected yet
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <input
                    type="checkbox"
                    name="isCurrentMember"
                    defaultChecked={profile ? profile.isCurrentMember : true}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-red-500"
                  />
                  <span>
                    <span className="block text-sm font-bold text-white">Current member</span>
                    <span className="mt-1 block text-sm text-[var(--color-muted)]">
                      Untick this if you are now an ex-member so your profile can move into the Hall of Fame section later.
                    </span>
                  </span>
                </label>
              </div>

              <div className="space-y-5">
                <fieldset className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <legend className="px-1 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Roles</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {TEAM_PROFILE_ROLE_OPTIONS.map((role) => (
                      <label key={role} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-black/15 px-3 py-3 text-sm text-white">
                        <input
                          type="checkbox"
                          name="roles"
                          value={role}
                          defaultChecked={profile?.roles.includes(role) ?? false}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-red-500"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">About You</span>
                  <textarea
                    name="bio"
                    rows={7}
                    maxLength={1200}
                    defaultValue={bioDefault}
                    onChange={(event) => setBioValue(event.target.value)}
                    placeholder="Share a short intro, what you work on, and what you enjoy about the team."
                    className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                    required
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[var(--color-muted)]">Keep this to 100 words or fewer.</span>
                    <span className={wordCount > 100 ? 'font-bold text-red-300' : 'text-[var(--color-muted)]'}>
                      {wordCount}/100 words
                    </span>
                  </div>
                </label>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
                  Your profile saves to Supabase so the public team page can eventually show current members first and alumni in a separate Hall of Fame section.
                </div>
              </div>
            </div>

            <SubmitButton hasProfile={Boolean(profile)} />
          </form>
        </div>
      </Card>
    </div>
  );
}

function SubmitButton({ hasProfile }: { hasProfile: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? 'Saving Profile...' : hasProfile ? 'Update Profile' : 'Create Profile'}
    </button>
  );
}
