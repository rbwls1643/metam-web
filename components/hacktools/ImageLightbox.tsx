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
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
      tabIndex={-1}
    >
      <div
        className="relative flex h-full w-full items-center justify-center p-6"
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