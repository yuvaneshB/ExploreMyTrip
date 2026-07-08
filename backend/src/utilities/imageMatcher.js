// High-quality, verified travel attraction images helper.
// Cleared of all automatic Unsplash/external image matching.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

const getValidImage = (img, backendUrl) => {
  if (!img) return DEFAULT_FALLBACK_IMAGE;

  let cleanImg = img;
  if (img.includes('/uploads/')) {
    cleanImg = '/uploads/' + img.split('/uploads/')[1];
  }

  if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('data:image/')) {
    return cleanImg;
  }

  // Resolve local path relative to public directory
  const relativePath = cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`;
  const localPath = path.resolve(__dirname, '../../public', relativePath.replace(/^\//, ''));

  if (fs.existsSync(localPath)) {
    return `${backendUrl}${relativePath}`;
  }

  // If local file does not exist (e.g., deployed environment), fallback to a beautiful default image
  return DEFAULT_FALLBACK_IMAGE;
};

export const getImagesForLocation = (name, city, country, category = '') => {
  return [];
};

/**
 * Helper to safely clean and process card images in a list.
 * Removes any external unsplash images, preserving only local uploads.
 */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return `http://localhost:${process.env.PORT || '4000'}`;
  }
  return 'https://exploremytrip.onrender.com';
};

export const assignUniqueImages = (cards = []) => {
  const backendUrl = getBackendUrl();
  return cards.map((card) => {
    // Clone card to prevent mutating original objects
    const cloned = JSON.parse(JSON.stringify(card));

    if (cloned.images && cloned.images.length > 0) {
      cloned.images = cloned.images
        .filter(img => img && !img.includes('unsplash.com'))
        .map(img => getValidImage(img, backendUrl));
    } else {
      cloned.images = [];
    }

    if (cloned.image && cloned.image.includes('unsplash.com')) {
      cloned.image = '';
    }

    if (cloned.images.length > 0) {
      cloned.image = cloned.images[0];
    } else {
      cloned.image = getValidImage('', backendUrl);
    }

    if (cloned.image && !cloned.image.startsWith('http://') && !cloned.image.startsWith('https://') && !cloned.image.startsWith('data:image/')) {
      cloned.image = getValidImage(cloned.image, backendUrl);
    }

    return cloned;
  });
};

export default {
  getImagesForLocation,
  assignUniqueImages
};
