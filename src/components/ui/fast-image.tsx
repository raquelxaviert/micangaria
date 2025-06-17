'use client';

import Image from 'next/image';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function FastImage({ src, alt, className, width, height }: FastImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width || 100}
      height={height || 100}
      style={{ objectFit: 'cover' }}
    />
  );
} 