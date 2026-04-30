"use client";

import { useEffect, useMemo, useState } from "react";
import ColorChip from "./ColorChip";
import DetectionBypassIcon from "./DetectionBypassIcon";
import NewBadge from "./NewBadge";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag?: string | null;
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
  caption?: string | null;
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

function cleanHackType(value?: string | null) {
  return (value || "일반").replace(" 핵", "").replace("핵", "");
}

export default function HackToolCardView({ tools, onSelect }: Props) {
  const [imageMap, setImageMap] = useState<Record<number, HackToolImage | null>>(
    {}
  );
  const [lightboxImage, setLightboxImage] = useState<HackToolImage | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const nextMap: Record<number, HackToolImage | null> = {};

      await Promise.all(
        tools.map(async (tool) => {
          try {
            const res = await fetch(
              `/api/hack-tool-images?hackToolId=${tool.id}`,
              { cache: "no-store" }
            );

            if (!res.ok) {
              nextMap[tool.id] = null;
              return;
            }

            const data = await res.json();
            nextMap[tool.id] =
              Array.isArray(data) && data.length > 0 ? data[0] : null;
          } catch {
            nextMap[tool.id] = null;
          }
        })
      );

      setImageMap(nextMap);
    };

    if (tools.length === 0) {
      setImageMap({});
      return;
    }

    loadImages();
  }, [tools]);

  const cards = useMemo(
    () =>
      tools.map((tool) => ({
        ...tool,
        image: imageMap[tool.id] || null,
      })),
    [tools, imageMap]
  );

  return (
    <>
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
                    setLightboxImage(tool.image);
                  }}
                  className="block h-full w-full"
                >
                  <img
                    src={tool.image.filePath}
                    alt={tool.image.fileName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800">
                      확대 보기
                    </span>
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

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-400">
                    검측 우회 여부
                  </span>
                  <DetectionBypassIcon value={tool.detectionBypass} />
                </div>

                <InfoLine label="테스트 기능" value={tool.testFeatures || "-"} />
                <InfoLine label="핵 유형" value={cleanHackType(tool.hackType)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-6 top-6 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900"
          >
            닫기
          </button>

          <img
            src={lightboxImage.filePath}
            alt={lightboxImage.fileName}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 font-semibold text-slate-400">{label}</span>
      <span className="break-words text-right font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}