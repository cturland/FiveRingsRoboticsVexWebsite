'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type PreviewImageProps = Omit<ImageProps, 'style'> & {
  className?: string;
  portraitObjectPosition?: string;
};

export default function PreviewImage({
  alt,
  className = '',
  portraitObjectPosition = 'center 20%',
  onLoad,
  ...props
}: PreviewImageProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      style={{
        objectPosition: isPortrait ? portraitObjectPosition : 'center',
      }}
      onLoad={(event) => {
        const target = event.currentTarget;
        setIsPortrait(target.naturalHeight > target.naturalWidth);
        onLoad?.(event);
      }}
    />
  );
}
