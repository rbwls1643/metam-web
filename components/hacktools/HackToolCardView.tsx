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

export default function HackToolCardView({ tools }: Props) {
  const [imageMap, setImageMap] = useState<Record<number, HackToolImage | null>>(
    {}
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  useEffect(() => {
    let ignore = false;

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

      if (!ignore) {
        setImageMap(nextMap);
      }
    };

    if (tools.length > 0) {
      loadCardImages();
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

  return (
    <>
      <ImageLightbox
        open={lightboxOpen}
        imageUrl={lightboxImageUrl}
        alt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((tool) => (
          <div
            key={tool.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <button
              type="button"
              onClick={() =>
                tool.image &&
                openLightbox(
                  tool.image.filePath,
                  tool.image.caption || tool.image.fileName || tool.name
                )
              }
              disabled={!tool.image}
              className="group block aspect-[16/10] w-full bg-slate-100"
            >
              {tool.image ? (
                <div className="relative h-full w-full">
                  <img
                    src={tool.image.filePath}
                    alt={tool.image.caption || tool.image.fileName}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">
                      확대 보기
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  등록된 UI 이미지 없음
                </div>
              )}
            </button>

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