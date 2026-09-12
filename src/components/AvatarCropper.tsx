import { useEffect, useRef, useState } from "react";
import { Crop, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const CROP_SIZE = 320;

type AvatarCropperProps = {
  file: File | null;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void>;
};

export function AvatarCropper({ file, onCancel, onConfirm }: AvatarCropperProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const pointerRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [source, setSource] = useState("");
  const MIN_ZOOM = 0.3;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSource(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function constrain(next: { x: number; y: number }, nextZoom = zoom) {
    const image = imageRef.current;
    if (!image) return next;
    const base = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight);
    const maxX = Math.max(0, (image.naturalWidth * base * nextZoom - CROP_SIZE) / 2);
    const maxY = Math.max(0, (image.naturalHeight * base * nextZoom - CROP_SIZE) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  async function createCrop() {
    const image = imageRef.current;
    if (!image || !file) return;
    setSaving(true);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) {
      setSaving(false);
      return;
    }
    const ratio = canvas.width / CROP_SIZE;
    const base = Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight);
    context.save();
    context.beginPath();
    context.arc(256, 256, 256, 0, Math.PI * 2);
    context.clip();
    context.translate(256 + offset.x * ratio, 256 + offset.y * ratio);
    context.scale(base * zoom * ratio, base * zoom * ratio);
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    context.restore();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
    if (blob) await onConfirm(new File([blob], "foto-perfil.png", { type: "image/png" }));
    setSaving(false);
  }

  const image = imageRef.current;
  const baseScale = image
    ? Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight)
    : 1;

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encuadrar foto de perfil</DialogTitle>
          <DialogDescription>Arrastrá la imagen y ajustá el zoom antes de guardarla.</DialogDescription>
        </DialogHeader>
        <div
          className="relative mx-auto h-80 w-80 max-w-full touch-none overflow-hidden rounded-full bg-muted ring-4 ring-border"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pointerRef.current = { x: event.clientX, y: event.clientY, left: offset.x, top: offset.y };
          }}
          onPointerMove={(event) => {
            if (!pointerRef.current) return;
            setOffset(
              constrain({
                x: pointerRef.current.left + event.clientX - pointerRef.current.x,
                y: pointerRef.current.top + event.clientY - pointerRef.current.y,
              }),
            );
          }}
          onPointerUp={() => (pointerRef.current = null)}
          onPointerCancel={() => (pointerRef.current = null)}
        >
          {source && (
            <img
              ref={imageRef}
              src={source}
              alt="Previsualización del recorte"
              draggable={false}
              onLoad={() => setOffset({ x: 0, y: 0 })}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: image ? image.naturalWidth * baseScale : CROP_SIZE,
                height: image ? image.naturalHeight * baseScale : CROP_SIZE,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-background/70" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar-zoom" className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4" /> Zoom
          </Label>
          <Slider
            id="avatar-zoom"
            min={MIN_ZOOM}
            max={3}
            step={0.05}
            value={[zoom]}
            onValueChange={([value]) => {
              const nextZoom = value ?? 1;
              setZoom(nextZoom);
              setOffset((current) => constrain(current, nextZoom));
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="button" onClick={() => void createCrop()} disabled={saving}>
            <Crop /> {saving ? "Guardando…" : "Recortar y subir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}