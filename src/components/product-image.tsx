"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

// Image URLs are typed in by users and can point to any host, so a plain <img>
// is used instead of next/image (which needs every host listed in the config).
export function ProductImage({ src, alt, className = "" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
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
    <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={`object-cover ${className}`} />
  );
}
