import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type LightboxImage = {
  src: string;
  alt: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

export function ImageLightbox({ images, index, onIndexChange }: ImageLightboxProps) {
  const isOpen = index !== null && Boolean(images[index]);
  const currentIndex = index ?? 0;
  const previous = () => onIndexChange((currentIndex - 1 + images.length) % images.length);
  const next = () => onIndexChange((currentIndex + 1) % images.length);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && images.length > 1) previous();
      if (event.key === "ArrowRight" && images.length > 1) next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!images[currentIndex]) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent className="flex h-dvh w-screen max-w-none items-center justify-center border-0 bg-foreground p-4 text-background sm:rounded-none [&>button]:hidden">
        <DialogTitle className="sr-only">Visor de portfolio</DialogTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 text-background hover:bg-background/15 hover:text-background"
          onClick={() => onIndexChange(null)}
          aria-label="Cerrar visor"
        >
          <X />
        </Button>
        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-background hover:bg-background/15 hover:text-background sm:left-6"
              onClick={previous}
              aria-label="Imagen anterior"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-background hover:bg-background/15 hover:text-background sm:right-6"
              onClick={next}
              aria-label="Imagen siguiente"
            >
              <ChevronRight />
            </Button>
          </>
        )}
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="max-h-[88dvh] max-w-[90vw] object-contain"
        />
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-background/80">
          {currentIndex + 1} / {images.length}
        </p>
      </DialogContent>
    </Dialog>
  );
}