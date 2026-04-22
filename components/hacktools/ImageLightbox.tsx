"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  imageUrl: string | null;
  imageAlt?: string;
  onClose: () => void;
};

export default function ImageLightbox({
  isOpen,
  imageUrl,
  imageAlt,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex max-h-[92vh] max-w-[92vw] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-xl bg-white/95 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-white"
        >
          닫기
        </button>

        <img
          src={imageUrl}
          alt={imageAlt || ""}
          className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}