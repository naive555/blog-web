'use client';
import { useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';
import Image from 'next/image';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface ImageEntry {
  existingId?: string; // set when the image is already stored on the backend
  file?: File; // set when the user just selected a local file
  preview: string; // blob URL (local) or https URL (backend)
  isCover: boolean;
  toDelete: boolean; // marked for removal on next save
}

interface ImageUploaderProps {
  value: ImageEntry[];
  onChange: (entries: ImageEntry[]) => void;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  const additionalRef = useRef<HTMLInputElement>(null);

  const active = value.filter((e) => !e.toDelete);
  const cover = active.find((e) => e.isCover);
  const additional = active.filter((e) => !e.isCover);

  function selectCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !ACCEPTED_TYPES.has(file.type)) return;
    e.target.value = '';

    // Replace existing cover: keep backend entry as toDelete, drop any pending cover
    const updated = value
      .map((entry) =>
        !entry.isCover
          ? entry
          : entry.existingId
            ? { ...entry, toDelete: true }
            : null,
      )
      .filter(Boolean) as ImageEntry[];

    updated.push({
      file,
      preview: URL.createObjectURL(file),
      isCover: true,
      toDelete: false,
    });
    onChange(updated);
  }

  function selectAdditional(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      ACCEPTED_TYPES.has(f.type),
    );
    if (!files.length) return;
    e.target.value = '';

    const slots = 6 - additional.length;
    if (slots <= 0) return;

    const added: ImageEntry[] = files.slice(0, slots).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      isCover: false,
      toDelete: false,
    }));

    onChange([...value, ...added]);
  }

  function remove(target: ImageEntry) {
    if (target.existingId) {
      onChange(value.map((e) => (e === target ? { ...e, toDelete: true } : e)));
    } else {
      URL.revokeObjectURL(target.preview);
      onChange(value.filter((e) => e !== target));
    }
  }

  return (
    <div className="space-y-4">
      {/* Cover image */}
      <div>
        <p className="text-sm font-medium mb-2">
          ภาพหน้าปก <span className="text-red-500">*</span>
        </p>
        {cover ? (
          <div className="relative w-40 h-28 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              src={cover.preview}
              alt="cover"
              className="w-full h-full object-cover"
              width={160}
              height={112}
              unoptimized
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(cover)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition">
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={disabled}
            className="w-40 h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 disabled:opacity-50 transition">
            <ImagePlus size={20} />
            <span className="text-xs mt-1">เลือกภาพ</span>
          </button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={selectCover}
          disabled={disabled}
        />
      </div>

      {/* Additional images */}
      <div>
        <p className="text-sm font-medium mb-2">
          ภาพประกอบ
          <span className="text-xs text-gray-400 font-normal ml-1">
            ({additional.length}/6)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {additional.map((entry, i) => (
            <div
              key={i}
              className="relative w-24 h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={entry.preview}
                alt={`img-${i}`}
                className="w-full h-full object-cover"
                width={96}
                height={80}
                unoptimized
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(entry)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {additional.length < 6 && !disabled && (
            <button
              type="button"
              onClick={() => additionalRef.current?.click()}
              className="w-24 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition">
              <ImagePlus size={16} />
              <span className="text-xs mt-1">เพิ่มภาพ</span>
            </button>
          )}
        </div>
        <input
          ref={additionalRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={selectAdditional}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
