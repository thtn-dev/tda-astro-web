export interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  color: string;
  blurDataUrl: string;
  caption: string;
  date?: string;
  tags?: string[];
}

export interface GalleryPageResponse {
  page: number;
  totalPages: number;
  totalPhotos: number;
  hasMore: boolean;
  photos: Photo[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: 'instagram' | 'tiktok' | 'threads' | 'facebook' | 'mail';
}

export interface SiteConfig {
  title: string;
  description: string;
  name: string;
  tagline: string;
  bio: string[];
  avatar: string;
  hobbies: string[];
  socials: SocialLink[];
  copyright: string;
}
