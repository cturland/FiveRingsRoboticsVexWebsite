import { teamSite } from '@/lib/teamSite';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { galleryEnabled } from '@/lib/galleryFeature';
import { getGalleryItems } from '@/lib/gallery';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = { title: 'Event Gallery | ' + teamSite.name };

export default async function GalleryPage() {
  if (!galleryEnabled) redirect('/updates');

  const images = await getGalleryItems();

  return <GalleryClient images={images} />;
}
