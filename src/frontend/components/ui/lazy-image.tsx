import { useState, useEffect, type ImgHTMLAttributes } from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/backend/lib/utils";

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

  useEffect(() => {
    // If the image is cached, we can check if it loaded instantly or reset
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
      {!isLoaded && !error && (
        <Skeleton
          className={cn("absolute inset-0 w-full h-full rounded-none bg-slate-200/60 dark:bg-slate-800/60", skeletonClassName)}
        />
      )}
      <img
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
