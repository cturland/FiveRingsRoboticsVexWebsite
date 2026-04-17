export type PublicGalleryItem = {
  id: number;
  mediaType: 'image' | 'youtube';
  image: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
  youtubeThumbnailUrl: string;
  title: string;
  category: string;
  date: string;
};
