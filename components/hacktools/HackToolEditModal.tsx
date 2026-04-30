"use client";

import { useEffect, useState } from "react";

type HackTool = {
  id: number;
  name: string;
  mainToolName?: string | null;
  region?: string | null;
  uiColorTag?: string | null;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
  gameName?: string | null;
};

type Props = {
  open: boolean;
  tool: HackTool | null;
  onClose: () => void;
  onUpdated: () => void;
};

const REGION_OPTIONS = ["중국", "국내", "글로벌"];

const UI_COLOR_OPTIONS = [
  "빨강",
  "주황",
  "노랑",
  "초록",
  "파랑",
  "남색",
  "보라",
  "분홍",
  "흰색",
  "검정",
  "기본",
];

const DETECTION_OPTIONS = ["우회 가능", "우회 불가"];

const HACK_TYPE_OPTIONS = ["PAK", "일반", "반동제어", "슬롯제"];

function toInputDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function HackToolEditModal({
  open,
  tool,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState("");
  const [mainToolName, setMainToolName] = useState("");
  const [region, setRegion] = useState("글로벌");
  const [uiColorTag, setUiColorTag] = useState("기본");
  const [latestTestDate, setLatestTestDate] = useState("");
  const [detectionBypass, setDetectionBypass] = useState("우회 불가능");
  const [testFeatures, setTestFeatures] = useState("");
  const [hackType, setHackType] = useState("일반");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!tool) return;

    setName(tool.name || "");
    setMainToolName(tool.mainToolName || "");
    setRegion(tool.region || "글로벌");
    setUiColorTag(tool.uiColorTag || "기본");
    setLatestTestDate(toInputDate(tool.latestTestDate));
    setDetectionBypass(tool.detectionBypass || "우회 불가능");
    setTestFeatures(tool.testFeatures || "");
    setHackType(tool.hackType || "일반");
  }, [tool]);

  if (!open || !tool) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("핵툴명을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch(`/api/hack-tools/${tool.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameName: tool.gameName || "PUBG PC",
          name: name.trim(),
          mainToolName: mainToolName.trim() || name.trim(),
          region,
          uiColorTag,
          latestTestDate: latestTestDate || null,
          detectionBypass,
          testFeatures: testFeatures.trim() || null,
          hackType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "핵툴 수정에 실패했습니다.");
        return;
      }

      onUpdated();
      onClose();
    } catch {
      alert("핵툴 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[620px] rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">
              핵툴 수정
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-400">
              {tool.gameName || "PUBG PC"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-500">핵툴명</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="핵툴명 입력"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-500">대표명</span>
            <input
              value={mainToolName}
              onChange={(e) => setMainToolName(e.target.value)}
              placeholder="비워두면 핵툴명과 동일"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-500">지역</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {REGION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-500">UI 색상</span>
              <select
                value={uiColorTag}
                onChange={(e) => setUiColorTag(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {UI_COLOR_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-500">
              최근 테스트일
            </span>
            <input
              type="date"
              value={latestTestDate}
              onChange={(e) => setLatestTestDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-500">
                검측 우회 여부
              </span>
              <select
                value={detectionBypass}
                onChange={(e) => setDetectionBypass(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {DETECTION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-500">핵 유형</span>
              <select
                value={hackType}
                onChange={(e) => setHackType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {HACK_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-bold text-slate-500">테스트 기능</span>
            <textarea
              value={testFeatures}
              onChange={(e) => setTestFeatures(e.target.value)}
              placeholder="예: ESP, Aimbot, No Recoil, Skin Unlock 등"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            취소
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}