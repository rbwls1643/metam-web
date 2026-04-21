"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ColorChip from "./ColorChip";
import ExternalDomainLink from "./ExternalDomainLink";
import ImageLightbox from "./ImageLightbox";
import NewBadge from "./NewBadge";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  downloadUrl: string | null;
  creatorUrl: string | null;
  saleUrl: string | null;
  latestTestDate?: string | null;
  gameName?: string | null;
  createdAt?: string | null;
};

type HackToolImage = {
  id: number;
  hackToolId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  caption: string;
  uploadedAt: string;
};

type Props = {
  tool: HackTool | null;
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function getRecentDateClasses(date?: string | null) {
  if (!date) {
    return "bg-slate-50 text-slate-500";
  }

  const value = new Date(date).getTime();
  if (Number.isNaN(value)) {
    return "bg-slate-50 text-slate-500";
  }

  const now = Date.now();
  const diffDays = Math.floor((now - value) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  if (diffDays <= 14) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (diffDays <= 30) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  return "bg-slate-50 text-slate-500";
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

export default function HackToolDetailPanel({ tool }: Props) {
  const [images, setImages] = useState<HackToolImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadImages = async (hackToolId: number) => {
    try {
      setIsLoadingImages(true);

      const res = await fetch(`/api/hack-tool-images?hackToolId=${hackToolId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setImages([]);
        setSelectedImageId(null);
        return;
      }

      const data = (await res.json()) as HackToolImage[];

      const nextImages = Array.isArray(data) ? data : [];
      setImages(nextImages);
      setSelectedImageId((prev) => {
        if (prev && nextImages.some((image) => image.id === prev)) {
          return prev;
        }
        return nextImages[0]?.id ?? null;
      });
    } catch {
      setImages([]);
      setSelectedImageId(null);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if (!tool) {
      setImages([]);
      setSelectedImageId(null);
      return;
    }

    loadImages(tool.id);
  }, [tool?.id]);

  const selectedIndex = useMemo(() => {
    if (images.length === 0) return -1;
    return images.findIndex((image) => image.id === selectedImageId);
  }, [images, selectedImageId]);

  const selectedImage = useMemo(() => {
    if (images.length === 0) return null;
    if (selectedIndex >= 0) return images[selectedIndex];
    return images[0];
  }, [images, selectedIndex]);

  const handleOpenFilePicker = () => {
    if (!tool || isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    if (!tool) return;

    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("hackToolId", String(tool.id));
      formData.append("caption", "");
      formData.append("file", file);

      const res = await fetch("/api/hack-tool-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("이미지 업로드에 실패했습니다.");
        return;
      }

      await loadImages(tool.id);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    await uploadFile(file);
  };

  const handleDeleteImage = async () => {
    if (!tool || !selectedImage) return;

    const ok = window.confirm("현재 이미지를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setIsDeletingImage(true);

      const res = await fetch(`/api/hack-tool-images/${selectedImage.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("이미지 삭제에 실패했습니다.");
        return;
      }

      await loadImages(tool.id);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handlePrevImage = () => {
    if (images.length <= 1 || selectedIndex <= 0) return;
    setSelectedImageId(images[selectedIndex - 1].id);
  };

  const handleNextImage = () => {
    if (images.length <= 1 || selectedIndex === -1 || selectedIndex >= images.length - 1) return;
    setSelectedImageId(images[selectedIndex + 1].id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tool || images.length <= 1) return;

      if (e.key === "ArrowLeft") {
        handlePrevImage();
      }

      if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tool, images, selectedIndex]);

  if (!tool) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-[520px] items-center justify-center text-sm text-slate-400">
          행을 선택하면 상세 정보와 이미지가 표시됩니다.
        </div>
      </aside>
    );
  }

  return (
    <>
      <ImageLightbox
        open={lightboxOpen}
        imageUrl={selectedImage?.filePath || null}
        alt={selectedImage?.caption || selectedImage?.fileName || tool.name}
        onClose={() => setLightboxOpen(false)}
      />

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-xl font-bold tracking-tight text-slate-900">
                {tool.name}
              </div>
              <NewBadge createdAt={tool.createdAt} />
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {tool.gameName || "-"}
            </div>
          </div>

          <ColorChip color={tool.uiColorTag} />
        </div>

        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">UI 이미지</h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {isLoadingImages ? "불러오는 중..." : `${images.length}개`}
              </span>

              <button
                type="button"
                onClick={handleOpenFilePicker}
                disabled={isUploadingImage}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-60"
              >
                {isUploadingImage ? "업로드 중..." : "이미지 추가"}
              </button>

              {selectedImage ? (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={isDeletingImage}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                >
                  {isDeletingImage ? "삭제 중..." : "이미지 삭제"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => selectedImage && setLightboxOpen(true)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              disabled={isUploadingImage}
              className={`group relative flex aspect-[16/10] w-full items-center justify-center bg-slate-100 transition ${
                isDragOver ? "ring-2 ring-blue-400" : ""
              }`}
            >
              {isLoadingImages ? (
                <div className="text-sm text-slate-400">이미지 불러오는 중...</div>
              ) : selectedImage ? (
                <>
                  <img
                    src={selectedImage.filePath}
                    alt={selectedImage.caption || selectedImage.fileName}
                    className="h-full w-full object-contain"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
                      클릭해서 크게 보기
                    </div>
                  </div>

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        disabled={selectedIndex <= 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white disabled:opacity-40"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        disabled={selectedIndex === -1 || selectedIndex >= images.length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white disabled:opacity-40"
                      >
                        →
                      </button>
                    </>
                  ) : null}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                  <span>등록된 이미지가 없습니다.</span>
                  <span className="text-xs text-slate-300">
                    클릭 또는 드래그해서 업로드
                  </span>
                </div>
              )}
            </button>
          </div>

          {images.length > 1 ? (
            <div className="mt-2 text-center text-xs text-slate-400">
              ← → 키보드로 이미지 전환 가능
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <InfoRow label="지역">{tool.region}</InfoRow>

          <InfoRow label="최근 테스트일">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${getRecentDateClasses(
                tool.latestTestDate
              )}`}
            >
              {formatDate(tool.latestTestDate)}
            </span>
          </InfoRow>

          <InfoRow label="다운로드">
            <ExternalDomainLink url={tool.downloadUrl} />
          </InfoRow>

          <InfoRow label="제작">
            <ExternalDomainLink url={tool.creatorUrl} />
          </InfoRow>

          <InfoRow label="판매">
            <ExternalDomainLink url={tool.saleUrl} />
          </InfoRow>
        </div>
      </aside>
    </>
  );
}