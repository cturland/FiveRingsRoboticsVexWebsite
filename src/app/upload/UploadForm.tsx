'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Card from '@/components/Card';
import { submitUpload, type UploadFormState } from './actions';

const categorySuggestions = [
  'Competition Day',
  'Build Season',
  'Driver Practice',
  'Robot Design',
  'Team Event',
];

const initialUploadFormState: UploadFormState = {
  status: 'idle',
  message: '',
};

type UploadFormProps = {
  userEmail: string;
};

export default function UploadForm({ userEmail }: UploadFormProps) {
  const [state, formAction] = useFormState(submitUpload, initialUploadFormState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setPreviewUrl(null);
      setSelectedFileName('');
    }
  }, [state.status]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <div className="mx-auto max-w-3xl py-6 sm:py-8">
      <Card className="space-y-6 overflow-hidden p-0">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,89,100,0.18),transparent_32%),linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] px-5 py-6 sm:px-7">
          <p className="eyebrow">Checkpoint 4</p>
          <h1 className="heading-display mt-4 text-3xl font-black text-white sm:text-4xl">Mobile Photo Upload</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            Add a gallery photo straight from a phone with the image, title, category, and event date. The upload is only available to approved student accounts.
          </p>

          <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Signed In As</p>
            <p className="mt-2 break-all text-sm font-bold text-white sm:text-base">{userEmail}</p>
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

          <form ref={formRef} action={formAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Image</span>
              <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/5 p-3">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-[var(--color-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white"
                  required
                />
                <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
                  Use the camera or photo library. Images up to 10 MB are accepted.
                </p>
                {selectedFileName ? (
                  <p className="mt-2 text-xs font-semibold text-white/90">{selectedFileName}</p>
                ) : null}
              </div>
            </label>

            {previewUrl ? (
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20">
                <Image
                  src={previewUrl}
                  alt="Selected upload preview"
                  width={1200}
                  height={900}
                  sizes="100vw"
                  className="h-64 w-full object-cover sm:h-80"
                  unoptimized
                />
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Title</span>
              <input
                type="text"
                name="title"
                placeholder="Quarterfinal alliance selfie"
                maxLength={120}
                className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Category</span>
              <input
                type="text"
                name="category"
                list="upload-category-suggestions"
                placeholder="Competition Day"
                maxLength={60}
                className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                required
              />
              <datalist id="upload-category-suggestions">
                {categorySuggestions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Date</span>
              <input
                type="date"
                name="date"
                className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10"
                required
              />
            </label>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              Successful uploads are sent to Supabase Storage and then saved as pending gallery submissions for review.
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
              Need to review submissions?
              {' '}
              <a href="/admin/gallery" className="font-bold text-white underline decoration-red-400/70 underline-offset-4">
                Open the gallery approval page
              </a>
              .
              {' '}
              Non-admin accounts will see the protected access message there.
            </div>

            <SubmitButton />
          </form>
        </div>
      </Card>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? 'Uploading Photo...' : 'Upload Photo'}
    </button>
  );
}
