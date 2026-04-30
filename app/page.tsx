"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import GameTabs from "@/components/layout/GameTabs";
import HackToolAddModal from "@/components/hacktools/HackToolAddModal";
import HackToolEditModal from "@/components/hacktools/HackToolEditModal";
import HackToolTable from "@/components/hacktools/HackToolTable";
import HackToolCardView from "@/components/hacktools/HackToolCardView";
import HackToolDetailPanel from "@/components/hacktools/HackToolDetailPanel";

export type HackTool = {
  id: number;
  gameId?: number | null;
  gameName?: string | null;
  name: string;
  mainToolName?: string | null;
  region: string;
  uiColorTag: string | null;
  latestTestDate?: string | null;

  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;

  downloadUrl?: string | null;
  creatorUrl?: string | null;
  saleUrl?: string | null;
  note?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const GAME_TABS = [
  "PUBG PC",
  "NEW STATE MOBILE",
  "PUBG: Blindspot",
  "PUBG: Black Budget",
];

const REGION_TABS = ["전체", "중국", "국내", "글로벌"];

const COLOR_OPTIONS = [
  "전체",
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

export default function Page() {
  const [game, setGame] = useState("PUBG PC");
  const [region, setRegion] = useState("전체");
  const [color, setColor] = useState("전체");
  const [sort, setSort] = useState("recent");
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const [tools, setTools] = useState<HackTool[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<HackTool | null>(null);

  const fetchTools = async () => {
    try {
      const res = await fetch(`/api/hack-tools?gameName=${encodeURIComponent(game)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        alert("핵툴 목록 조회에 실패했습니다.");
        return;
      }

      const data = (await res.json()) as HackTool[];
      setTools(data);

      if (data.length > 0) {
        setSelectedId((prev) => {
          if (prev && data.some((tool) => tool.id === prev)) return prev;
          return data[0].id;
        });
      } else {
        setSelectedId(null);
      }
    } catch {
      alert("핵툴 목록 조회 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchTools();
  }, [game]);

  const filtered = useMemo(() => {
    let next = [...tools];

    if (region !== "전체") {
      next = next.filter((tool) => tool.region === region);
    }

    if (color !== "전체") {
      next = next.filter((tool) => (tool.uiColorTag || "기본") === color);
    }

    const q = keyword.trim().toLowerCase();

    if (q) {
      next = next.filter((tool) => {
        return [
          tool.name,
          tool.mainToolName,
          tool.region,
          tool.uiColorTag,
          tool.detectionBypass,
          tool.testFeatures,
          tool.hackType,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      });
    }

    if (sort === "recent") {
      next.sort((a, b) => {
        const aTime = a.latestTestDate ? new Date(a.latestTestDate).getTime() : 0;
        const bTime = b.latestTestDate ? new Date(b.latestTestDate).getTime() : 0;
        return bTime - aTime;
      });
    }

    if (sort === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name));
    }

    return next;
  }, [tools, region, color, keyword, sort]);

  const selectedTool =
    filtered.find((tool) => tool.id === selectedId) || filtered[0] || null;

  const handleOpenEditModal = (tool: HackTool) => {
    setEditingTool(tool);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("이 핵툴을 삭제할까요?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/hack-tools/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "핵툴 삭제에 실패했습니다.");
        return;
      }

      await fetchTools();
    } catch {
      alert("핵툴 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <HackToolAddModal
        open={addModalOpen}
        gameName={game}
        onClose={() => setAddModalOpen(false)}
        onCreated={fetchTools}
      />

      <HackToolEditModal
        open={editModalOpen}
        tool={editingTool}
        onClose={() => {
          setEditModalOpen(false);
          setEditingTool(null);
        }}
        onUpdated={fetchTools}
      />

      <main className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-[1900px]">
          <AppHeader />

          <GameTabs games={GAME_TABS} onChange={setGame} />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              {REGION_TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    region === item
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="핵툴명, 색상, 검측 우회, 테스트 기능, 핵 유형으로 검색..."
                className="h-12 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
              />

              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400 xl:w-[180px]"
              >
                {COLOR_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    색상: {item}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400 xl:w-[180px]"
              >
                <option value="recent">테스트일: 최근 순</option>
                <option value="name">핵툴명 순</option>
              </select>

              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="h-12 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                + 핵툴 추가
              </button>

              <div className="flex h-12 items-center justify-center rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-600">
                총 {filtered.length}개
              </div>
            </div>
          </section>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              카드
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              표
            </button>
          </div>

          {viewMode === "table" ? (
            <section className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
              <HackToolTable
                tools={filtered}
                selectedId={selectedId}
                onRowSelect={(tool) => setSelectedId(tool.id)}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />

              <HackToolDetailPanel tool={selectedTool} />
            </section>
          ) : (
            <section className="mt-4">
              <HackToolCardView tools={filtered} />
            </section>
          )}
        </div>
      </main>
    </>
  );
}