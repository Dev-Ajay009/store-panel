"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className = "" }: Props) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={`${alt} (no image)`}
        className={`flex items-center justify-center bg-gray-100 font-semibold text-gray-400 uppercase ${className}`}
      >
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
