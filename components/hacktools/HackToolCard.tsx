"use client";

import { useEffect, useState } from "react";
import ColorChip from "./ColorChip";
import ExternalDomainLink from "./ExternalDomainLink";
import ImageLightbox from "./ImageLightbox";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  downloadUrl: string | null;
  creatorUrl: string | null;
  saleUrl: string | null;
  latestTestDate?: string | null;
};

type HackToolImage = {
  id: number;
  filePath: string;
  fileName: string;
  caption: string;
};

type Props = {
  tool: HackTool;
  isSelectedForCompare: boolean;
  onToggleCompare: (toolId: number) => void;
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function HackToolCard({
  tool,
  isSelectedForCompare,
  onToggleCompare,
}: Props) {
  const [image, setImage] = useState<HackToolImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadImage = async () => {
      try {
        const res = await fetch(`/api/hack-tool-images?hackToolId=${tool.id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (!ignore) setImage(null);
          return;
        }

        const data = await res.json();

        if (!ignore) {
          setImage(Array.isArray(data) && data.length > 0 ? data[0] : null);
        }
      } catch {
        if (!ignore) setImage(null);
      }
    };

    loadImage();

    return () => {
      ignore = true;
    };
  }, [tool.id]);

  return (
    <>
      <ImageLightbox
        isOpen={lightboxOpen}
        imageUrl={image?.filePath || null}
        imageAlt={image?.caption || image?.fileName || tool.name}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <button
          type="button"
          onClick={() => image && setLightboxOpen(true)}
          disabled={!image}
          className="group block aspect-[16/10] w-full bg-slate-100"
        >
          {image ? (
            <div className="relative h-full w-full">
              <img
                src={image.filePath}
                alt={image.caption || image.fileName}
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
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {tool.name}
              </div>
              <div className="mt-1 text-sm text-slate-500">{tool.region}</div>
            </div>

            <ColorChip color={tool.uiColorTag} />
          </div>

          <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            최근 테스트일: {formatDate(tool.latestTestDate)}
          </div>

          <div className="mb-4 space-y-2 text-sm">
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

          <button
            type="button"
            onClick={() => onToggleCompare(tool.id)}
            className={`w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
              isSelectedForCompare
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {isSelectedForCompare ? "비교 선택됨" : "비교에 추가"}
          </button>
        </div>
      </div>
    </>
  );
}