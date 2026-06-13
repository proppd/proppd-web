'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getListingPhotoClient, isUploadableImage, uploadListingPhoto } from '@/lib/listings/photo-upload-client';

export type ListingPhoto = { src: string; alt: string };

interface PhotoUploadProps {
  existingPhotos?: ListingPhoto[];
  onChange?: (photos: ListingPhoto[]) => void;
}

export function PhotoUpload({ existingPhotos = [], onChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<ListingPhoto[]>(existingPhotos);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const client = useMemo(() => getListingPhotoClient(), []);

  useEffect(() => {
    let active = true;
    if (!client) {
      setStorageReady(false);
      return;
    }
    client.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setStorageReady(Boolean(data.user?.id));
    });
    return () => {
      active = false;
    };
  }, [client]);

  const commit = useCallback(
    (next: ListingPhoto[]) => {
      setPhotos(next);
      onChange?.(next);
    },
    [onChange],
  );

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError('');

      if (!client || !userId) {
        setError('Sign in again to upload photos — your session may have expired.');
        return;
      }

      const images = Array.from(files).filter(isUploadableImage);
      if (images.length === 0) {
        setError('Choose image files (JPG, PNG, WebP) under 10MB each.');
        return;
      }

      setUploading((count) => count + images.length);
      const uploaded: ListingPhoto[] = [];

      for (const file of images) {
        const result = await uploadListingPhoto(client, userId, file);
        if (result.success) {
          uploaded.push({ src: result.url, alt: file.name.replace(/\.[^.]+$/, '') });
        } else {
          setError(result.error);
        }
        setUploading((count) => Math.max(0, count - 1));
      }

      if (uploaded.length > 0) {
        commit([...photos, ...uploaded]);
      }
    },
    [client, userId, photos, commit],
  );

  const removePhoto = (index: number) => commit(photos.filter((_, i) => i !== index));

  const movePhoto = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void addFiles(e.dataTransfer.files);
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#1A1A2E]">Photos</h3>
      <p className="mt-1 text-sm text-[#6B7280]">Add photos to make your listing stand out. The first photo is the main image buyers see.</p>

      {storageReady === false && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          Photo uploads need a connected account and storage. You can still save the listing and add photos later.
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
          dragOver ? 'border-[#4A3AFF] bg-[#4A3AFF]/5' : 'border-[#E5E7EB] bg-[#F7F8FA]'
        }`}
      >
        <Upload size={24} className="text-[#9CA3AF]" />
        <p className="mt-3 text-sm font-bold text-[#1A1A2E]">Drop photos here or click to upload</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">JPG, PNG, WebP up to 10MB each</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={storageReady === false}
          className="mt-4 rounded-lg bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0] disabled:opacity-50"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {uploading > 0 && (
        <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#4A3AFF]">
          <Loader2 size={15} className="animate-spin" /> Uploading {uploading} photo{uploading === 1 ? '' : 's'}…
        </p>
      )}

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.src} className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} className="h-32 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 transition group-hover:bg-black/40">
                <button
                  type="button"
                  onClick={() => movePhoto(i, -1)}
                  disabled={i === 0}
                  className="rounded-full bg-white/90 p-1.5 text-[#1A1A2E] opacity-0 transition hover:bg-white group-hover:opacity-100 disabled:opacity-0"
                  aria-label="Move earlier"
                >
                  <ArrowLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="rounded-full bg-white/90 p-1.5 text-[#1A1A2E] opacity-0 transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(i, 1)}
                  disabled={i === photos.length - 1}
                  className="rounded-full bg-white/90 p-1.5 text-[#1A1A2E] opacity-0 transition hover:bg-white group-hover:opacity-100 disabled:opacity-0"
                  aria-label="Move later"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-[#4A3AFF] px-2 py-0.5 text-[10px] font-bold text-white">Main</span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-[#9CA3AF]">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} · Hover a photo to reorder or remove it.
      </p>
    </div>
  );
}
