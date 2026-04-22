"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImageLightbox from "./ImageLightbox";

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
  gameName?: string | null;
  region?: string | null;
  uiColorTag?: string | null;
  latestTestDate?: string | null;
  downloadUrl?: string | null;
  creatorUrl?: string | null;
  saleUrl?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getColorBadgeClass(color?: string | null) {
  switch (color) {
    case "빨강":
      return "border-red-200 bg-red-50 text-red-600";
    case "주황":
      return "border-orange-200 bg-orange-50 text-orange-600";
    case "노랑":
      return "border-amber-200 bg-amber-50 text-amber-600";
    case "초록":
      return "border-emerald-200 bg-emerald-50 text-emerald-600";
    case "파랑":
      return "border-blue-200 bg-blue-50 text-blue-600";
    case "남색":
      return "border-indigo-200 bg-indigo-50 text-indigo-600";
    case "보라":
      return "border-violet-200 bg-violet-50 text-violet-600";
    case "흰색":
      return "border-slate-200 bg-white text-slate-500";
    case "검정":
      return "border-slate-900 bg-slate-900 text-white";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function HackToolDetailPanel({
  tool,
}: {
  tool: HackTool | null;
}) {
  const [images, setImages] = useState<HackToolImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const imageCount = useMemo(() => images.length, [images]);
  const mainImage = images[0] ?? null;

  const fetchImages = async (hackToolId: number) => {
    try {
      const res = await fetch(`/api/hack-tool-images?hackToolId=${hackToolId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[client] image fetch failed:", data);
        setImages([]);
        return;
      }

      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[client] image fetch error:", error);
      setImages([]);
    }
  };

  useEffect(() => {
    if (!tool?.id) {
      setImages([]);
      return;
    }

    fetchImages(tool.id);
  }, [tool?.id]);

  const handleImageUpload = async (file: File) => {
    if (!tool?.id) return;

    try {
      setIsUploading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(
          `업로드 API 실패\nstep: ${uploadData?.step ?? "-"}\nmessage: ${
            uploadData?.message ?? "unknown"
          }\nerror: ${uploadData?.error ?? "-"}`
        );
        return;
      }

      const saveRes = await fetch("/api/hack-tool-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hackToolId: tool.id,
          fileName: uploadData.fileName,
          filePath: uploadData.url,
          fileSize: uploadData.size,
          mimeType: uploadData.mimeType,
          caption: "",
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        alert(
          `DB 저장 실패\nstep: ${saveData?.step ?? "-"}\nmessage: ${
            saveData?.message ?? "unknown"
          }\nerror: ${saveData?.error ?? "-"}`
        );
        return;
      }

      await fetchImages(tool.id);
    } catch (error) {
      console.error("[client] image upload failed:", error);
      alert(`이미지 업로드 예외\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  if (!tool) {
    return (
      <aside className="sticky top-6 flex h-full min-h-[520px] items-center justify-center rounded-[28px] border border-slate-200 bg-white px-8 py-10 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <p className="text-center text-base font-medium text-slate-400">
          행을 선택하면 상세 정보와 이미지가 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="sticky top-6 h-fit rounded-[28px] border border-slate-200 bg-white px-7 py-7 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-950">
              {tool.name}
            </h3>
            <p className="mt-1 text-[15px] font-medium text-slate-500">
              {tool.gameName || "-"}
            </p>
          </div>

          <div
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold ${getColorBadgeClass(
              tool.uiColorTag
            )}`}
          >
            {tool.uiColorTag || "기본"}
          </div>
        </div>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[15px] font-extrabold text-slate-950">UI 이미지</h4>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-400">{imageCount}개</span>

              <label
                htmlFor="hacktool-image-upload"
                className={`inline-flex cursor-pointer items-center rounded-2xl px-4 py-2 text-sm font-bold transition ${
                  isUploading
                    ? "bg-blue-100 text-blue-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isUploading ? "업로드 중..." : "이미지 추가"}
              </label>

              <input
                ref={inputRef}
                id="hacktool-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleImageUpload(file);
                }}
              />
            </div>
          </div>

          {mainImage ? (
            <button
              type="button"
              onClick={() => setLightboxImage(mainImage.filePath)}
              className="block w-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50"
            >
              <img
                src={mainImage.filePath}
                alt={mainImage.fileName}
                className="h-[320px] w-full object-cover"
              />
            </button>
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-center">
              <p className="text-base font-bold text-slate-400">등록된 이미지가 없습니다.</p>
              <p className="mt-2 text-sm font-medium text-slate-300">
                클릭 또는 드래그해서 업로드
              </p>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">지역</p>
            <p className="text-base font-bold text-slate-900">{tool.region || "-"}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">최근 테스트일</p>
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {formatDate(tool.latestTestDate)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">다운로드</p>
            {tool.downloadUrl ? (
              <a
                href={tool.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-base font-semibold text-blue-600 hover:underline"
              >
                {tool.downloadUrl}
              </a>
            ) : (
              <p className="text-base font-bold text-slate-900">-</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">제작</p>
            {tool.creatorUrl ? (
              <a
                href={tool.creatorUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-base font-semibold text-blue-600 hover:underline"
              >
                {tool.creatorUrl}
              </a>
            ) : (
              <p className="text-base font-bold text-slate-900">-</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">판매</p>
            {tool.saleUrl ? (
              <a
                href={tool.saleUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-base font-semibold text-blue-600 hover:underline"
              >
                {tool.saleUrl}
              </a>
            ) : (
              <p className="text-base font-bold text-slate-900">-</p>
            )}
          </div>
        </div>
      </aside>

      <ImageLightbox
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage}
        imageAlt={tool.name}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}