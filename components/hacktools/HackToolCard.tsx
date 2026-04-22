"use client";

import { useMemo, useState } from "react";
import ColorChip from "./ColorChip";
import ExternalDomainLink from "./ExternalDomainLink";
import ImageLightbox from "./ImageLightbox";
import NewBadge from "./NewBadge";

type HackToolImage = {
  id: number;
  hackToolId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  caption: string | null;
  uploadedAt: string | null;
};

type HackTool = {
  id: number;
  name: string;
  mainToolName?: string | null;
  region?: string | null;
  uiColorTag?: string | null;
  downloadUrl?: string | null;
  creatorUrl?: string | null;
  saleUrl?: string | null;
  latestTestDate?: string | null;
  createdAt?: string | null;
  isNew?: boolean;
  images?: HackToolImage[];
};

type Props = {
  tool: HackTool;
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
}

function getRecentDateClasses(date?: string | null) {
  if (!date) {
    return "border-slate-200 bg-slate-100 text-slate-400";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "border-slate-200 bg-slate-100 text-slate-400";
  }

  const today = new Date();
  const diff =
    (today.getTime() -
      new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime()) /
    (1000 * 60 * 60 * 24);

  if (diff <= 7) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (diff <= 30) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-500";
}

export default function HackToolCard({ tool }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const image = useMemo(() => {
    if (!tool.images || tool.images.length === 0) return null;
    return tool.images[0];
  }, [tool.images]);

  return (
    <>
      <ImageLightbox
        isOpen={lightboxOpen}
        imageUrl={image?.filePath || null}
        imageAlt={image?.caption || image?.fileName || tool.name}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="relative bg-slate-100">
          {image ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full"
            >
              <img
                src={image.filePath}
                alt={image.caption || image.fileName || tool.name}
                className="h-[300px] w-full object-cover"
              />
            </button>
          ) : (
            <div className="flex h-[300px] items-center justify-center bg-slate-100 text-slate-300">
              등록된 이미지 없음
            </div>
          )}

          {image && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 px-6 py-3 text-xl font-bold text-slate-700 shadow-lg backdrop-blur-sm"
            >
              확대보기
            </button>
          )}
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[26px] font-extrabold tracking-tight text-slate-950">
                  {tool.name}
                </h3>
                {tool.isNew && <NewBadge />}
              </div>
              <p className="mt-3 text-[18px] font-medium text-slate-500">
                {tool.region || "-"}
              </p>
            </div>

            <ColorChip color={tool.uiColorTag || "기본"} />
          </div>

          <div>
            <span
              className={`inline-flex rounded-2xl border px-4 py-2 text-[16px] font-semibold ${getRecentDateClasses(
                tool.latestTestDate
              )}`}
            >
              최근 테스트일: {formatDate(tool.latestTestDate)}
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[18px] font-medium text-slate-400">다운로드</span>
              <ExternalDomainLink url={tool.downloadUrl || null} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[18px] font-medium text-slate-400">제작</span>
              <ExternalDomainLink url={tool.creatorUrl || null} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-[18px] font-medium text-slate-400">판매</span>
              <ExternalDomainLink url={tool.saleUrl || null} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}