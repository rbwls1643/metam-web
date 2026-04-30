"use client";

import { useEffect, useMemo, useState } from "react";
import ColorChip from "./ColorChip";
import ImageLightbox from "./ImageLightbox";
import NewBadge from "./NewBadge";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
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
  onSelect: (tool: HackTool) => void;
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function HackToolCardView({ tools, onSelect }: Props) {
  const [imageMap, setImageMap] = useState<Record<number, HackToolImage | null>>(
    {}
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const loadImages = async () => {
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
          nextMap[tool.id] = Array.isArray(data) && data.length > 0 ? data[0] : null;
        } catch {
          nextMap[tool.id] = null;
        }
      })
    );

    setImageMap(nextMap);
  };

  useEffect(() => {
    if (tools.length === 0) {
      setImageMap({});
      return;
    }

    loadImages();
  }, [tools]);

  const cards = useMemo(() => {
    return tools.map((tool) => ({
      ...tool,
      image: imageMap[tool.id] || null,
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
        isOpen={lightboxOpen}
        imageUrl={lightboxImageUrl}
        imageAlt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelect(tool)}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="group relative aspect-[16/10] w-full bg-slate-100">
              {tool.image ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(
                      tool.image!.filePath,
                      tool.image!.caption || tool.image!.fileName || tool.name
                    );
                  }}
                  className="block h-full w-full"
                >
                  <img
                    src={tool.image.filePath}
                    alt={tool.image.caption || tool.image.fileName}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800">
                      확대 보기
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                  등록된 UI 이미지 없음
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
                    {tool.name}
                    <NewBadge createdAt={tool.createdAt} />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    {tool.region}
                  </div>
                </div>

                <ColorChip color={tool.uiColorTag} />
              </div>

              <div className="space-y-3 text-sm">
                <InfoLine label="최근 테스트일" value={formatDate(tool.latestTestDate)} />
                <InfoLine label="검측 우회 여부" value={tool.detectionBypass || "확인 전"} />
                <InfoLine label="테스트 기능" value={tool.testFeatures || "-"} />
                <InfoLine label="핵 유형" value={tool.hackType || "일반 핵"} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 font-semibold text-slate-400">{label}</span>
      <span className="break-words text-right font-bold text-slate-800">{value}</span>
    </div>
  );
}