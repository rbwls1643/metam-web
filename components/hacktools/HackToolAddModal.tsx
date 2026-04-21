"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  gameName: string;
  onClose: () => void;
  onCreated: () => void;
};

type FormState = {
  name: string;
  region: string;
  uiColorTag: string;
  downloadUrl: string;
  creatorUrl: string;
  saleUrl: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  region: "글로벌",
  uiColorTag: "기본",
  downloadUrl: "",
  creatorUrl: "",
  saleUrl: "",
};

export default function HackToolAddModal({
  open,
  gameName,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setIsSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("핵툴명을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch("/api/hack-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameName,
          name: form.name.trim(),
          region: form.region,
          uiColorTag: form.uiColorTag,
          downloadUrl: form.downloadUrl.trim() || null,
          creatorUrl: form.creatorUrl.trim() || null,
          saleUrl: form.saleUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        alert("핵툴 추가에 실패했습니다.");
        return;
      }

      onCreated();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">핵툴 추가</h2>
            <p className="mt-1 text-sm text-slate-400">{gameName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">핵툴명</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="예: LD3"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">지역</label>
              <select
                value={form.region}
                onChange={(e) => updateField("region", e.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="중국">중국</option>
                <option value="국내">국내</option>
                <option value="글로벌">글로벌</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">UI 색상</label>
              <select
                value={form.uiColorTag}
                onChange={(e) => updateField("uiColorTag", e.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="빨강">빨강</option>
                <option value="주황">주황</option>
                <option value="노랑">노랑</option>
                <option value="초록">초록</option>
                <option value="파랑">파랑</option>
                <option value="남색">남색</option>
                <option value="보라">보라</option>
                <option value="흰색">흰색</option>
                <option value="검정">검정</option>
                <option value="기본">기본</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">다운로드 주소</label>
            <input
              value={form.downloadUrl}
              onChange={(e) => updateField("downloadUrl", e.target.value)}
              placeholder="https://example.com"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">제작 주소</label>
            <input
              value={form.creatorUrl}
              onChange={(e) => updateField("creatorUrl", e.target.value)}
              placeholder="https://example.com"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">판매 주소</label>
            <input
              value={form.saleUrl}
              onChange={(e) => updateField("saleUrl", e.target.value)}
              placeholder="https://example.com"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "추가 중..." : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}