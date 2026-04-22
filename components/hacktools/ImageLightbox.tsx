"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-6 py-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-7xl items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-slate-900 shadow-lg transition hover:bg-white"
          aria-label="닫기"
        >
          ×
        </button>

        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}