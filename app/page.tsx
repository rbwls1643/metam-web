"use client";

import { useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import GameTabs from "@/components/layout/GameTabs";
import HackToolFilterBar from "@/components/hacktools/HackToolFilterBar";
import HackToolTable from "@/components/hacktools/HackToolTable";
import HackToolCardView from "@/components/hacktools/HackToolCardView";
import HackToolDetailPanel from "@/components/hacktools/HackToolDetailPanel";
import HackToolAddModal from "@/components/hacktools/HackToolAddModal";
import HackToolEditModal from "@/components/hacktools/HackToolEditModal";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  downloadUrl: string | null;
  creatorUrl: string | null;
  saleUrl: string | null;
  latestTestDate?: string | null;
  gameName?: string | null;
  createdAt?: string | null;
};

function normalizeRegion(region?: string | null) {
  if (!region) return "글로벌";
  if (region === "한국") return "국내";
  return region;
}

export default function Page() {
  const [tools, setTools] = useState<HackTool[]>([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("전체");
  const [color, setColor] = useState("전체");
  const [testSort, setTestSort] = useState("desc");
  const [game, setGame] = useState("PUBG PC");
  const [view, setView] = useState<"table" | "card">("table");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<HackTool | null>(null);

  const fetchTools = async () => {
    const res = await fetch("/api/hack-tools", {
      cache: "no-store",
    });

    if (!res.ok) {
      setTools([]);
      return;
    }

    const data = await res.json();

    const normalizedTools = (Array.isArray(data) ? data : []).map(
      (tool: HackTool) => ({
        ...tool,
        region: normalizeRegion(tool.region),
      })
    );

    setTools(normalizedTools);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const filtered = useMemo(() => {
    let result = [...tools];

    result = result.filter((tool) => {
      if (!tool.gameName) return true;
      return tool.gameName === game;
    });

    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter((tool) =>
        [
          tool.name,
          tool.region,
          tool.uiColorTag,
          tool.downloadUrl,
          tool.creatorUrl,
          tool.saleUrl,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (region !== "전체") {
      result = result.filter((tool) => tool.region === region);
    }

    if (color !== "전체") {
      result = result.filter((tool) => tool.uiColorTag === color);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.latestTestDate || 0).getTime();
      const dateB = new Date(b.latestTestDate || 0).getTime();

      return testSort === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [tools, search, region, color, testSort, game]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!filtered.some((tool) => tool.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selectedTool = filtered.find((tool) => tool.id === selectedId) ?? null;

  const handleDelete = async (id: number) => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    const res = await fetch(`/api/hack-tools/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }

    await fetchTools();
  };

  const handleLatestTestDateChange = async (
    id: number,
    latestTestDate: string | null
  ) => {
    const res = await fetch(`/api/hack-tools/${id}/latest-test-date`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latestTestDate }),
    });

    if (!res.ok) {
      alert("최근 테스트일 저장에 실패했습니다.");
      return;
    }

    setTools((prev) =>
      prev.map((tool) =>
        tool.id === id
          ? {
              ...tool,
              latestTestDate,
            }
          : tool
      )
    );
  };

  const handleOpenEditModal = (tool: HackTool) => {
    setEditingTool(tool);
    setEditModalOpen(true);
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

          <GameTabs game={game} onChange={setGame} />

          <HackToolFilterBar
            search={search}
            region={region}
            color={color}
            testSort={testSort}
            onSearchChange={setSearch}
            onRegionChange={setRegion}
            onColorChange={setColor}
            onTestSortChange={setTestSort}
            onAdd={() => setAddModalOpen(true)}
            totalCount={filtered.length}
          />

          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setView("card")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                view === "card"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              카드
            </button>

            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                view === "table"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              표
            </button>
          </div>

          {view === "table" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <HackToolTable
                tools={filtered}
                selectedId={selectedId}
                onRowSelect={(tool) => setSelectedId(tool.id)}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                onLatestTestDateChange={handleLatestTestDateChange}
              />
              <HackToolDetailPanel tool={selectedTool} />
            </div>
          ) : (
            <HackToolCardView tools={filtered} />
          )}
        </div>
      </main>
    </>
  );
}