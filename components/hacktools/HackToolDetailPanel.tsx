"use client";

import { useEffect, useState } from "react";

type HackTool = {
  id: number;
  name: string;
  region: string;
};

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

export default function HackToolDetailPanel({
  tool,
}: {
  tool: HackTool | null;
}) {
  const [images, setImages] = useState<HackToolImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchImages = async (hackToolId: number) => {
    try {
      const res = await fetch(
        `/api/hack-tool-images?hackToolId=${hackToolId}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        setImages([]);
        return;
      }

      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
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

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData?.message);
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
          mimeType: uploadData.mimeType,
          fileSize: uploadData.size,
          caption: "",
        }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveData?.message);
      }

      await fetchImages(tool.id);
    } catch (e) {
      console.error(e);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!tool) {
    return <div className="p-4">선택된 핵툴 없음</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-bold">{tool.name}</div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">UI 이미지</span>

          <label
            htmlFor="image-upload"
            className="cursor-pointer text-sm px-3 py-1 bg-blue-500 text-white rounded"
          >
            {isUploading ? "업로드 중..." : "이미지 추가"}
          </label>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await handleImageUpload(file);
              e.currentTarget.value = "";
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.filePath}
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-sm text-gray-400">
            등록된 이미지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}