"use client";

interface PreviewMediaProps {
  url: string;
  alt: string;
  className?: string;
  overlay?: React.ReactNode;
}

export function PreviewMedia({ url, alt, className, overlay }: PreviewMediaProps) {
  const isVideo = url.match(/\.(mp4|webm|mov)(\?|$)/i) || url.includes("replicate.delivery");
  if (isVideo) {
    return (
      <div className={`relative ${className ?? ""}`}>
        <video
          src={url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
        {overlay}
      </div>
    );
  }
  return (
    <div className={`relative ${className ?? ""}`}>
      <img src={url} alt={alt} className="w-full h-full object-cover" />
      {overlay}
    </div>
  );
}
