"use client";

import { useEffect, useMemo, useState } from "react";
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
  tools: HackTool[];
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

function DeleteImageButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title="이미지 삭제"
      aria-label="이미지 삭제"
      onClick={onClick}
      className="inline-flex h-6 w-6 items-center rounded-full text-red-500 transition hover:text-red-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 12a2 2 0 0 1-2-2V7h16v12a2 2 0 0 1-2 2H6Z" />
      </svg>
    </button>
  );
}

export default function HackToolCardView({ tools }: Props) {
  const [imageMap, setImageMap] = useState<Record<number, HackToolImage | null>>(
    {}
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const loadCardImages = async () => {
    const nextMap: Record<number, HackToolImage | null> = {};

    await Promise.all(
      tools.map(async (tool) => {
        try {
          const res = await fetch(`/api/hack-tool-images?hackToolId=${tool.id}`, {
            cache: "no-store",
          });

          if (!res.ok) {
            nextMap[tool.id] = null;
            return;
          }

          const data = (await res.json()) as HackToolImage[];
          nextMap[tool.id] =
            Array.isArray(data) && data.length > 0 ? data[0] : null;
        } catch {
          nextMap[tool.id] = null;
        }
      })
    );

    setImageMap(nextMap);
  };

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      const nextMap: Record<number, HackToolImage | null> = {};

      await Promise.all(
        tools.map(async (tool) => {
          try {
            const res = await fetch(`/api/hack-tool-images?hackToolId=${tool.id}`, {
              cache: "no-store",
            });

            if (!res.ok) {
              nextMap[tool.id] = null;
              return;
            }

            const data = (await res.json()) as HackToolImage[];
            nextMap[tool.id] =
              Array.isArray(data) && data.length > 0 ? data[0] : null;
          } catch {
            nextMap[tool.id] = null;
          }
        })
      );

      if (!ignore) {
        setImageMap(nextMap);
      }
    };

    if (tools.length > 0) {
      run();
    } else {
      setImageMap({});
    }

    return () => {
      ignore = true;
    };
  }, [tools]);

  const cards = useMemo(() => {
    return tools.map((tool) => ({
      ...tool,
      image: imageMap[tool.id] ?? null,
    }));
  }, [tools, imageMap]);

  const openLightbox = (imageUrl: string, alt: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  const handleDeleteImage = async (imageId: number) => {
    const ok = window.confirm("이 UI 이미지를 삭제할까요?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/hack-tool-images/${imageId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "이미지 삭제에 실패했습니다.");
        return;
      }

      await loadCardImages();
      setLightboxOpen(false);
      setLightboxImageUrl(null);
      setLightboxAlt("");
    } catch {
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <ImageLightbox
        isOpen={lightboxOpen}
        imageUrl={lightboxImageUrl}
        imageAlt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((tool) => (
          <div
            key={tool.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="group relative aspect-[16/10] w-full bg-slate-100">
              {tool.image ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(
                        tool.image!.filePath,
                        tool.image!.caption || tool.image!.fileName || tool.name
                      )
                    }
                    className="block h-full w-full"
                  >
                    <div className="relative h-full w-full">
                      <img
                        src={tool.image.filePath}
                        alt={tool.image.caption || tool.image.fileName}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/25 group-hover:opacity-100">
                        <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
                          확대 보기
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="pointer-events-none absolute right-2 top-2 opacity-0 transition duration-200 group-hover:opacity-100">
                    <div className="pointer-events-auto">
                      <DeleteImageButton
                        onClick={() => handleDeleteImage(tool.image!.id)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  등록된 UI 이미지 없음
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-lg font-semibold text-slate-900">
                      {tool.name}
                    </div>
                    <NewBadge createdAt={tool.createdAt} />
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{tool.region}</div>
                </div>

                <ColorChip color={tool.uiColorTag} />
              </div>

              <div className="mb-4">
                <span
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${getRecentDateClasses(
                    tool.latestTestDate
                  )}`}
                >
                  최근 테스트일: {formatDate(tool.latestTestDate)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">다운로드</span>
                  <ExternalDomainLink url={tool.downloadUrl} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">제작</span>
                  <ExternalDomainLink url={tool.creatorUrl} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">판매</span>
                  <ExternalDomainLink url={tool.saleUrl} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}