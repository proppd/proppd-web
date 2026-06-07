'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Image, GripVertical } from 'lucide-react';

interface PhotoUploadProps {
  listingSlug?: string;
  existingPhotos?: Array<{ src: string; alt: string }>;
  onChange?: (photos: Array<{ src: string; alt: string }>) => void;
}

export function PhotoUpload({ listingSlug, existingPhotos = [], onChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Array<{ src: string; alt: string; file?: File }>>(
    existingPhotos.map((p) => ({ ...p }))
  );
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        src: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ''),
        file,
      }));
    const updated = [...photos, ...newPhotos];
    setPhotos(updated);
    onChange?.(updated.map(({ src, alt }) => ({ src, alt })));
  }, [photos, onChange]);

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onChange?.(updated.map(({ src, alt }) => ({ src, alt })));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#1A1A2E]">Photos</h3>
      <p className="mt-1 text-sm text-[#6B7280]">Add photos to make your listing stand out. First photo is the main image.</p>

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
          dragOver ? 'border-[#4A3AFF] bg-[#4A3AFF]/5' : 'border-[#E5E7EB] bg-[#F7F8FA]'
        }`}
      >
        <Upload size={24} className="text-[#9CA3AF]" />
        <p className="mt-3 text-sm font-bold text-[#1A1A2E]">Drop photos here or click to upload</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">JPG, PNG, WebP up to 10MB each</p>
        <label className="mt-4 cursor-pointer rounded-lg bg-[#4A3AFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3A2AE0]">
          Choose files
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.src} className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
              <img src={photo.src} alt={photo.alt} className="h-32 w-full object-cover" />
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="rounded-full bg-white/90 p-1.5 text-[#1A1A2E] opacity-0 transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Badge */}
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-[#4A3AFF] px-2 py-0.5 text-[10px] font-bold text-white">Main</span>
              )}
              {/* Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-xs font-bold text-white">{photo.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-[#9CA3AF]">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} · Drag to reorder (coming soon)
      </p>
    </div>
  );
}
