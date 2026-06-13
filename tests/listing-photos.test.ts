import { describe, expect, it } from 'vitest';
import { parseListingPhotos, validatePortalListingInput } from '@/lib/proppd/listing-editor';
import { buildPhotoPath, isUploadableImage } from '@/lib/listings/photo-upload-client';

describe('parseListingPhotos', () => {
  it('keeps valid http(s) photos with alt fallbacks', () => {
    const photos = parseListingPhotos([
      { src: 'https://cdn.proppd.com/a.jpg', alt: 'Front' },
      { src: 'https://cdn.proppd.com/b.jpg' },
    ]);
    expect(photos).toEqual([
      { src: 'https://cdn.proppd.com/a.jpg', alt: 'Front' },
      { src: 'https://cdn.proppd.com/b.jpg', alt: 'Listing photo' },
    ]);
  });

  it('drops non-url and malformed entries', () => {
    const photos = parseListingPhotos([
      { src: 'javascript:alert(1)', alt: 'bad' },
      { src: 'not-a-url' },
      'string',
      null,
    ]);
    expect(photos).toEqual([]);
  });

  it('caps the number of photos', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ src: `https://cdn.proppd.com/${i}.jpg`, alt: `${i}` }));
    expect(parseListingPhotos(many)).toHaveLength(20);
  });
});

describe('validatePortalListingInput with photos', () => {
  const base = {
    title: 'Modern 3-bed house in Sandton',
    purpose: 'sale',
    status: 'draft',
    price: 3500000,
    description: 'A lovely home with a garden and pool, close to schools.',
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    propertyTypeSlug: 'house',
  };

  it('includes parsed photos in valid output', () => {
    const result = validatePortalListingInput({ ...base, photos: [{ src: 'https://cdn.proppd.com/a.jpg', alt: 'Front' }] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.photos).toEqual([{ src: 'https://cdn.proppd.com/a.jpg', alt: 'Front' }]);
    }
  });

  it('defaults to an empty photo list when omitted', () => {
    const result = validatePortalListingInput(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.photos).toEqual([]);
    }
  });
});

describe('photo upload client helpers', () => {
  it('builds a user-scoped storage path with the original extension', () => {
    const path = buildPhotoPath('user-123', 'My Photo.PNG');
    expect(path.startsWith('user-123/')).toBe(true);
    expect(path.endsWith('.png')).toBe(true);
  });

  it('rejects non-images and oversized files', () => {
    const tooBig = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const notImage = new File([new Uint8Array(10)], 'doc.pdf', { type: 'application/pdf' });
    const ok = new File([new Uint8Array(10)], 'ok.jpg', { type: 'image/jpeg' });
    expect(isUploadableImage(tooBig)).toBe(false);
    expect(isUploadableImage(notImage)).toBe(false);
    expect(isUploadableImage(ok)).toBe(true);
  });
});
