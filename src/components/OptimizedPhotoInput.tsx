'use client';

import { useState } from 'react';
import { formatFileSize, optimizeImageFile, setFileInputFile } from '@/lib/clientImageOptimization';

type OptimizedPhotoInputProps = {
  name: string;
  maxDimension: number;
  className?: string;
};

export default function OptimizedPhotoInput({ name, maxDimension, className }: OptimizedPhotoInputProps) {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [note, setNote] = useState('');

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      setSelectedFileName('');
      setNote('');
      return;
    }

    setSelectedFileName('Optimizing photo...');
    setNote('');

    try {
      const optimized = await optimizeImageFile(file, {
        maxDimension,
        quality: 0.82,
      });

      if (optimized.wasOptimized && !setFileInputFile(input, optimized.file)) {
        setSelectedFileName(file.name);
        setNote('This browser could not attach the optimized file, so the original photo will be uploaded.');
        return;
      }

      setSelectedFileName(optimized.file.name);
      setNote(
        optimized.wasOptimized
          ? `Optimized from ${formatFileSize(optimized.originalSize)} to ${formatFileSize(optimized.file.size)} before upload.`
          : 'This image is already small enough for upload.',
      );
    } catch (error) {
      console.error('Photo optimization failed:', error);
      setSelectedFileName(file.name);
      setNote('This photo could not be optimized in the browser, so the original file will be uploaded.');
    }
  }

  return (
    <>
      <input
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className={className}
      />
      {selectedFileName ? (
        <p className="mt-2 text-xs font-semibold text-white/90">{selectedFileName}</p>
      ) : null}
      {note ? (
        <p className="mt-2 text-xs leading-5 text-red-200/90">{note}</p>
      ) : null}
    </>
  );
}
