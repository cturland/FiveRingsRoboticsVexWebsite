import { getGalleryItems } from '@/lib/gallery';
import GalleryClient from './GalleryClient';

export default async function GalleryPage() {
  const images = await getGalleryItems();

  return <GalleryClient images={images} />;
}
