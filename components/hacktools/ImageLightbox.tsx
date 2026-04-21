"use client";

type Props = {
  open: boolean;
  imageUrl: string | null;
  alt?: string;
  onClose: () => void;
};

export default function ImageLightbox({
  open,
  imageUrl,
  alt,
  onClose,
}: Props) {
  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        닫기
      </button>

      <div
        className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt || "확대 이미지"}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
    </div>
  );
}