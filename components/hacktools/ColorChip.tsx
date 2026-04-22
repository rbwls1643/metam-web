"use client";

export default function ColorChip({ color }: { color?: string | null }) {
  const value = color || "기본";

  const colorClassMap: Record<string, string> = {
    빨강: "border-red-200 bg-red-50 text-red-600",
    주황: "border-orange-200 bg-orange-50 text-orange-600",
    노랑: "border-amber-200 bg-amber-50 text-amber-600",
    초록: "border-emerald-200 bg-emerald-50 text-emerald-600",
    파랑: "border-blue-200 bg-blue-50 text-blue-600",
    남색: "border-indigo-200 bg-indigo-50 text-indigo-600",
    보라: "border-violet-200 bg-violet-50 text-violet-600",
    분홍: "border-pink-200 bg-pink-50 text-pink-600",
    흰색: "border-slate-200 bg-white text-slate-500",
    검정: "border-slate-900 bg-slate-900 text-white",
    기본: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
        colorClassMap[value] || colorClassMap["기본"]
      }`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-current opacity-90" />
      {value}
    </span>
  );
}