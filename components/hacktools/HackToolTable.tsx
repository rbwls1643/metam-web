"use client";

import ColorChip from "./ColorChip";
import NewBadge from "./NewBadge";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string | null;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
  createdAt?: string | null;
};

type Props = {
  tools: HackTool[];
  selectedId: number | null;
  onRowSelect: (tool: HackTool) => void;
  onEdit: (tool: HackTool) => void;
  onDelete: (id: number) => void;
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function HackToolTable({
  tools,
  selectedId,
  onRowSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-4 text-left font-bold">#</th>
              <th className="px-5 py-4 text-left font-bold">UI 색상</th>
              <th className="px-5 py-4 text-left font-bold">핵툴명</th>
              <th className="px-5 py-4 text-left font-bold">지역</th>
              <th className="px-5 py-4 text-left font-bold">최근 테스트일</th>
              <th className="px-5 py-4 text-left font-bold">검측 우회 여부</th>
              <th className="px-5 py-4 text-left font-bold">테스트 기능</th>
              <th className="px-5 py-4 text-left font-bold">핵 유형</th>
              <th className="px-5 py-4 text-right font-bold">관리</th>
            </tr>
          </thead>

          <tbody>
            {tools.map((tool, index) => (
              <tr
                key={tool.id}
                onClick={() => onRowSelect(tool)}
                className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                  selectedId === tool.id ? "bg-blue-50/60" : "bg-white"
                }`}
              >
                <td className="px-5 py-4 text-slate-400">{index + 1}</td>

                <td className="px-5 py-4">
                  <ColorChip color={tool.uiColorTag} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    {tool.name}
                    <NewBadge createdAt={tool.createdAt} />
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-600">{tool.region}</td>

                <td className="px-5 py-4">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {formatDate(tool.latestTestDate)}
                  </span>
                </td>

                <td className="px-5 py-4 font-semibold text-slate-700">
                  {tool.detectionBypass || "확인 전"}
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {tool.testFeatures || "-"}
                </td>

                <td className="px-5 py-4 font-semibold text-slate-700">
                  {tool.hackType || "일반 핵"}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(tool);
                      }}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                    >
                      수정
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(tool.id);
                      }}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {tools.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-16 text-center text-sm font-semibold text-slate-400"
                >
                  등록된 핵툴이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}