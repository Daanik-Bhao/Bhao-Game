import { useEffect } from 'react';

const imagesToPreload = [
  '/avatars/green cards.webp',
  '/avatars/blue cards.webp',
  '/avatars/red cards.webp',
  '/avatars/green.webp',
  '/avatars/blue.webp',
  '/avatars/red.webp'
];

export function usePreloadImages() {
  useEffect(() => {
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
}
