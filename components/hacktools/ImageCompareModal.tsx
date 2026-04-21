"use client";

import { useEffect, useState } from "react";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
};

type HackToolImage = {
  id: number;
  filePath: string;
  fileName: string;
  caption: string;
};

type CompareItem = {
  tool: HackTool;
  image: HackToolImage | null;
};

type Props = {
  open: boolean;
  tools: HackTool[];
  onClose: () => void;
};

export default function ImageCompareModal({ open, tools, onClose }: Props) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || tools.length === 0) {
      setItems([]);
      return;
    }

    let ignore = false;

    const loadImages = async () => {
      try {
        setIsLoading(true);

        const nextItems = await Promise.all(
          tools.map(async (tool) => {
            try {
              const res = await fetch(`/api/hack-tool-images?hackToolId=${tool.id}`, {
                cache: "no-store",
              });

              if (!res.ok) {
                return { tool, image: null };
              }

              const data = await res.json();
              const image =
                Array.isArray(data) && data.length > 0 ? data[0] : null;

              return { tool, image };
            } catch {
              return { tool, image: null };
            }
          })
        );

        if (!ignore) {
          setItems(nextItems);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      ignore = true;
    };
  }, [open, tools]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[1500px] overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">이미지 비교</h2>
            <p className="mt-1 text-sm text-slate-500">
              선택한 핵툴 UI 이미지를 한 화면에서 비교합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-auto p-6">
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
              비교 이미지 불러오는 중...
            </div>
          ) : (
            <div className={`grid gap-4 ${tools.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {items.map(({ tool, image }) => (
                <div
                  key={tool.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="border-b border-slate-200 bg-white px-4 py-3">
                    <div className="text-base font-semibold text-slate-900">
                      {tool.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {tool.region}
                    </div>
                  </div>

                  <div className="aspect-[16/10] bg-slate-100">
                    {image ? (
                      <img
                        src={image.filePath}
                        alt={image.caption || image.fileName || tool.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        등록된 이미지 없음
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}