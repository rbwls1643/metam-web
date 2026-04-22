"use client";

import { useEffect, useRef } from "react";

type ImageLightboxProps = {
  isOpen: boolean;
  imageUrl: string | null;
  imageAlt?: string;
  onClose: () => void;
};

export default function ImageLightbox({
  isOpen,
  imageUrl,
  imageAlt = "확대 이미지",
  onClose,
}: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  console.log("ImageLightbox mounted", { isOpen, imageUrl });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("keydown detected:", event.key);

      if (event.key === "Escape") {
        console.log("ESC pressed -> closing");
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex h-full w-full items-center justify-center p-6 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-3xl font-bold leading-none text-slate-900 shadow-lg transition hover:bg-white"
          aria-label="닫기"
        >
          ×
        </button>

        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}