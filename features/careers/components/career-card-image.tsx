import { cn } from "@/lib/utils";

type CareerCardImageProps = {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
};

/** Full-width card image: edge-to-edge, uncropped, natural aspect ratio. */
export function CareerCardImage({
  src,
  alt,
  className,
  aspectClass = "aspect-video",
}: CareerCardImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted/20",
        aspectClass,
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
