"use client";

const REGION_OPTIONS = ["전체", "중국", "국내", "글로벌"] as const;

type Props = {
  search: string;
  region: string;
  color: string;
  testSort: string;
  onSearchChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onTestSortChange: (v: string) => void;
  onAdd: () => void;
  totalCount: number;
};

export default function HackToolFilterBar({
  search,
  region,
  color,
  testSort,
  onSearchChange,
  onRegionChange,
  onColorChange,
  onTestSortChange,
  onAdd,
  totalCount,
}: Props) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {REGION_OPTIONS.map((item) => {
          const active = region === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onRegionChange(item)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(320px,1fr)_180px_180px_140px_110px]">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="핵툴명, 주소, 색상으로 검색..."
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
        />

        <select
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
        >
          <option value="전체">색상: 전체</option>
          <option value="빨강">색상: 빨강</option>
          <option value="주황">색상: 주황</option>
          <option value="노랑">색상: 노랑</option>
          <option value="초록">색상: 초록</option>
          <option value="파랑">색상: 파랑</option>
          <option value="남색">색상: 남색</option>
          <option value="보라">색상: 보라</option>
          <option value="흰색">색상: 흰색</option>
          <option value="검정">색상: 검정</option>
          <option value="기본">색상: 기본</option>
        </select>

        <select
          value={testSort}
          onChange={(e) => onTestSortChange(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
        >
          <option value="desc">테스트일: 최근 순</option>
          <option value="asc">테스트일: 오래된 순</option>
        </select>

        <button
          type="button"
          onClick={onAdd}
          className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + 핵툴 추가
        </button>

        <div className="flex h-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-600">
          총 {totalCount}개
        </div>
      </div>
    </div>
  );
}