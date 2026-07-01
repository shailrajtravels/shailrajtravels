import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/frontend/shared/ui/skeleton';
import { cn } from '@/backend/shared/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  skeletonClassName?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  skeletonClassName,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the image is cached, it might have loaded before React attaches the onLoad listener
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      setError(false);
    }
  }, [src]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
      {!isLoaded && !error && (
        <Skeleton
          className={cn("absolute inset-0 w-full h-full rounded-none bg-slate-200/60 dark:bg-slate-800/60", skeletonClassName)}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full transition-opacity duration-500 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
