import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

export type LightboxImage = { url: string; altText?: string | null };

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Props = {
  images: LightboxImage[];
  index: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onClose: () => void;
};

export function ImageLightbox({ images, index, onIndexChange, open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTapRef = useRef(0);

  stateRef.current = { zoom, offset };

  useEffect(() => setMounted(true), []);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, index, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const next = useCallback(() => {
    if (images.length > 1) onIndexChange((index + 1) % images.length);
  }, [images.length, index, onIndexChange]);
  const prev = useCallback(() => {
    if (images.length > 1) onIndexChange((index - 1 + images.length) % images.length);
  }, [images.length, index, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, next, prev]);

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const nz = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
    const k = nz / z;
    const nx = px - (px - o.x) * k;
    const ny = py - (py - o.y) * k;
    setZoom(nz);
    setOffset(nz === 1 ? { x: 0, y: 0 } : { x: nx, y: ny });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0015));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: stateRef.current.zoom };
      dragRef.current = null;
    } else if (stateRef.current.zoom > 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    } else {
      swipeRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = containerRef.current;
    if (pointers.current.size === 2 && pinchRef.current && el) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = el.getBoundingClientRect();
      const cx = (a.x + b.x) / 2 - rect.left;
      const cy = (a.y + b.y) / 2 - rect.top;
      const target = clamp((pinchRef.current.zoom * dist) / pinchRef.current.dist, MIN_ZOOM, MAX_ZOOM);
      zoomAt(cx, cy, target / stateRef.current.zoom);
      return;
    }
    if (dragRef.current) {
      setOffset({
        x: dragRef.current.ox + (e.clientX - dragRef.current.x),
        y: dragRef.current.oy + (e.clientY - dragRef.current.y),
      });
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const sw = swipeRef.current;
    swipeRef.current = null;
    if (sw && stateRef.current.zoom === 1 && !pinchRef.current) {
      const dx = e.clientX - sw.x;
      const dy = e.clientY - sw.y;
      const fast = Date.now() - sw.t < 800;
      if (fast && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      } else if (fast && dy > 90 && Math.abs(dy) > Math.abs(dx)) {
        onClose();
      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && e.pointerType === "touch") {
        // duplo toque amplia
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          const el = containerRef.current;
          if (el) {
            const r = el.getBoundingClientRect();
            zoomAt(e.clientX - r.left, e.clientY - r.top, 2.5);
          }
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }
    }
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  if (!open || !mounted) return null;
  const img = images[index];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-foreground/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 p-3 md:p-4">
        <span className="text-xs uppercase tracking-widest text-background/70">
          {images.length > 1 ? `${index + 1} / ${images.length}` : "Zoom"}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Diminuir zoom"
            onClick={() => zoomAt(0, 0, 1 / 1.4)}
            className="rounded-full p-2 text-background/80 transition hover:bg-background/10 hover:text-background"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            aria-label="Aumentar zoom"
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              const r = el.getBoundingClientRect();
              zoomAt(r.width / 2, r.height / 2, 1.4);
            }}
            className="rounded-full p-2 text-background/80 transition hover:bg-background/10 hover:text-background"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-full p-2 text-background/80 transition hover:bg-background/10 hover:text-background"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={(e) => {
          const el = containerRef.current;
          if (!el) return;
          if (zoom > 1) return reset();
          const r = el.getBoundingClientRect();
          zoomAt(e.clientX - r.left, e.clientY - r.top, 2.5);
        }}
        className="relative flex-1 select-none overflow-hidden"
        style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "zoom-in" }}
      >
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? ""}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain p-4 md:p-10"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: dragRef.current || pinchRef.current ? "none" : "transform 120ms ease-out",
            }}
          />
        )}

        {images.length > 1 && (
          <>
            <button
              aria-label="Imagem anterior"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow transition hover:bg-background md:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Próxima imagem"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow transition hover:bg-background md:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 md:justify-center md:p-4">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-background/90 transition ${
                i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={im.url} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
