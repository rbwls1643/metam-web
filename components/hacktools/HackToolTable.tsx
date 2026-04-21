"use client";

import { useState } from "react";
import ColorChip from "./ColorChip";
import ExternalDomainLink from "./ExternalDomainLink";
import NewBadge from "./NewBadge";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  downloadUrl: string | null;
  creatorUrl: string | null;
  saleUrl: string | null;
  latestTestDate?: string | null;
  createdAt?: string | null;
};

type Props = {
  tools: HackTool[];
  selectedId: number | null;
  onRowSelect: (tool: HackTool) => void;
  onEdit: (tool: HackTool) => void;
  onDelete: (id: number) => void;
  onLatestTestDateChange: (
    id: number,
    latestTestDate: string | null
  ) => Promise<void>;
};

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function toInputDate(date?: string | null) {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRecentDateClasses(date?: string | null) {
  if (!date) return "bg-slate-50 text-slate-500";

  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return "bg-slate-50 text-slate-500";

  const now = Date.now();
  const diffDays = Math.floor((now - value) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  if (diffDays <= 14) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  if (diffDays <= 30) return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";

  return "bg-slate-50 text-slate-500";
}

export default function HackToolTable({
  tools,
  selectedId,
  onRowSelect,
  onEdit,
  onDelete,
  onLatestTestDateChange,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleDateSave = async (id: number, value: string) => {
    try {
      setSavingId(id);
      await onLatestTestDateChange(id, value || null);
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[720px] overflow-auto">
        <table className="w-full min-w-[1500px] table-fixed text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-sm">
            <tr className="border-b border-slate-200">
              <th className="w-[60px] px-4 py-4 text-left font-semibold">#</th>
              <th className="w-[140px] px-4 py-4 text-left font-semibold">UI 색상</th>
              <th className="w-[280px] px-4 py-4 text-left font-semibold">핵툴명</th>
              <th className="w-[120px] px-4 py-4 text-left font-semibold">지역</th>
              <th className="w-[220px] px-4 py-4 text-left font-semibold">최근 테스트일</th>
              <th className="w-[220px] px-4 py-4 text-left font-semibold">다운로드</th>
              <th className="w-[220px] px-4 py-4 text-left font-semibold">제작</th>
              <th className="w-[220px] px-4 py-4 text-left font-semibold">판매</th>
              <th className="w-[96px] px-4 py-4 text-right font-semibold"></th>
            </tr>
          </thead>

          <tbody>
            {tools.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center text-sm text-slate-400">
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              tools.map((tool, index) => {
                const isEditing = editingId === tool.id;
                const isSaving = savingId === tool.id;
                const isSelected = selectedId === tool.id;

                return (
                  <tr
                    key={tool.id}
                    onClick={() => onRowSelect(tool)}
                    className={`cursor-pointer border-b border-slate-100 transition ${
                      isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-4 text-slate-400">{index + 1}</td>

                    <td className="px-4 py-4">
                      <ColorChip color={tool.uiColorTag} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-[16px] font-semibold text-slate-900">
                          {tool.name}
                        </div>
                        <NewBadge createdAt={tool.createdAt} />
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600">{tool.region}</td>

                    <td className="px-4 py-4">
                      {isEditing ? (
                        <input
                          type="date"
                          defaultValue={toInputDate(tool.latestTestDate)}
                          autoFocus
                          disabled={isSaving}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => handleDateSave(tool.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleDateSave(tool.id, (e.target as HTMLInputElement).value);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium outline-none focus:border-blue-400"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(tool.id);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition hover:opacity-90 ${getRecentDateClasses(
                            tool.latestTestDate
                          )}`}
                        >
                          {isSaving ? "저장 중..." : formatDate(tool.latestTestDate)}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <ExternalDomainLink url={tool.downloadUrl} />
                    </td>

                    <td className="px-4 py-4">
                      <ExternalDomainLink url={tool.creatorUrl} />
                    </td>

                    <td className="px-4 py-4">
                      <ExternalDomainLink url={tool.saleUrl} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {isSelected ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(tool);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-blue-600 transition hover:bg-slate-200"
                              title="수정"
                              aria-label="수정"
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tool.id);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-red-600 transition hover:bg-slate-200"
                              title="삭제"
                              aria-label="삭제"
                            >
                              <DeleteIcon />
                            </button>
                          </>
                        ) : (
                          <div className="h-8 w-8 opacity-0" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}