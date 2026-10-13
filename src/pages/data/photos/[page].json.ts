import type { APIRoute } from 'astro';
import photosData from '../../../data/photos.json';
import type { Photo, GalleryPageResponse } from '../../../types/gallery';

const PAGE_SIZE = 18;

export function getStaticPaths() {
  const photos = photosData as Photo[];
  const totalPhotos = photos.length;
  const totalPages = Math.ceil(totalPhotos / PAGE_SIZE) || 1;

  const paths = [];

  for (let i = 0; i < totalPages; i++) {
    const page = i + 1;
    const start = i * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pagePhotos = photos.slice(start, end);

    const payload: GalleryPageResponse = {
      page,
      totalPages,
      totalPhotos,
      hasMore: page < totalPages,
      photos: pagePhotos,
    };

    // Support both /data/photos/page-1.json and /data/photos/1.json
    paths.push({
      params: { page: `page-${page}` },
      props: payload,
    });
    paths.push({
      params: { page: String(page) },
      props: payload,
    });
  }

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  return new Response(JSON.stringify(props), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
