"use client";

import { useEffect, useRef, useState } from "react";
import ColorChip from "./ColorChip";
import DetectionBypassIcon from "./DetectionBypassIcon";

type HackToolImage = {
  id: number;
  hackToolId: number;
  fileName: string;
  filePath: string;
  fileSize?: number | null;
  mimeType?: string | null;
  caption?: string | null;
  uploadedAt?: string | null;
};

type HackTool = {
  id: number;
  name: string;
  gameName?: string | null;
  region?: string | null;
  uiColorTag?: string | null;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getTestDateClass(value?: string | null) {
  if (!value) return "border-slate-200 bg-slate-50 text-slate-500";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 30) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (diffDays <= 60) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function cleanHackType(value?: string | null) {
  return (value || "일반").replace(" 핵", "").replace("핵", "");
}

export default function HackToolDetailPanel({
  tool,
}: {
  tool: HackTool | null;
}) {
  const [images, setImages] = useState<HackToolImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<HackToolImage | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchImages = async (hackToolId: number) => {
    try {
      const res = await fetch(`/api/hack-tool-images?hackToolId=${hackToolId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setImages([]);
        return;
      }

      setImages(Array.isArray(data) ? data : []);
    } catch {
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

  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  const handleImageUpload = async (file: File) => {
    if (!tool?.id) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(uploadData?.message || "이미지 업로드에 실패했습니다.");
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
        alert(saveData?.message || "이미지 DB 저장에 실패했습니다.");
        return;
      }

      await fetchImages(tool.id);
    } catch {
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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

      if (tool?.id) await fetchImages(tool.id);
      setLightboxImage(null);
    } catch {
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  const mainImage = images[0] || null;

  if (!tool) {
    return (
      <aside className="sticky top-6 flex min-h-[520px] items-center justify-center rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-semibold text-slate-400">
          행을 선택하면 상세 정보가 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <>
      <aside className="sticky top-6 h-fit rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-950">
              {tool.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {tool.gameName || "PUBG PC"}
            </p>
          </div>

          <ColorChip color={tool.uiColorTag} />
        </div>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-950">
              UI 이미지
            </h4>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">
                {images.length}개
              </span>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                title="이미지 추가"
              >
                +
              </button>

              {mainImage && (
                <button
                  type="button"
                  onClick={() => handleDeleteImage(mainImage.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                  title="이미지 삭제"
                >
                  🗑
                </button>
              )}

              <input
                ref={inputRef}
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
              onClick={() => setLightboxImage(mainImage)}
              className="block w-full overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50"
            >
              <img
                src={mainImage.filePath}
                alt={mainImage.fileName}
                className="h-[320px] w-full object-cover"
              />
            </button>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex h-[320px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50"
            >
              <p className="text-base font-bold text-slate-400">
                등록된 이미지가 없습니다.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                클릭 또는 드래그해서 업로드
              </p>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <InfoBox label="지역" value={tool.region || "-"} />

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">
              최근 테스트일
            </p>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getTestDateClass(
                tool.latestTestDate
              )}`}
            >
              {formatDate(tool.latestTestDate)}
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="mb-2 text-sm font-bold text-slate-400">
              검측 우회 여부
            </p>
            <DetectionBypassIcon value={tool.detectionBypass} />
          </div>

          <InfoBox label="테스트 기능" value={tool.testFeatures || "-"} />
          <InfoBox label="핵 유형" value={cleanHackType(tool.hackType)} />
        </div>
      </aside>

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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="mb-2 text-sm font-bold text-slate-400">{label}</p>
      <p className="break-words text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}