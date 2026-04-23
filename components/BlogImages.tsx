import Image from 'next/image';
import type { BlogImage } from '@/lib/types';

interface BlogImagesProps {
  images: BlogImage[];
  title: string;
}

export function BlogImages({ images, title }: BlogImagesProps) {
  const cover = images.find((img) => img.isCover);
  const extras = images.filter((img) => !img.isCover).slice(0, 6);

  if (!cover && extras.length === 0) return null;

  return (
    <div className="space-y-3">
      {cover && (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={cover.url}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      {extras.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {extras.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={img.url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 250px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
