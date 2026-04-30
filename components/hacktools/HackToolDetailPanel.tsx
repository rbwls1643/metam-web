import DetectionBypassIcon from "./DetectionBypassIcon";
import ColorChip from "./ColorChip";

type HackTool = {
  id: number;
  name: string;
  gameName?: string | null;
  region: string | null;
  uiColorTag: string | null;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
};

export default function HackToolDetailPanel({
  tool,
}: {
  tool: HackTool | null;
}) {
  if (!tool) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400">
        선택된 항목이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      
      {/* 제목 */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xl font-bold text-slate-800">{tool.name}</p>
          <p className="text-sm text-slate-400">{tool.region}</p>
        </div>
        <ColorChip color={tool.uiColorTag} />
      </div>

      {/* UI 이미지 영역 (기존 유지) */}
      <div className="rounded-xl border border-slate-200 bg-slate-100 h-[200px] flex items-center justify-center text-slate-400 text-sm">
        등록된 이미지가 없습니다
      </div>

      {/* 상세 정보 */}
      <div className="space-y-3 text-sm">

        {/* 날짜 */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-400 font-semibold mb-1">최근 테스트일</p>
          <p className="font-medium">
            {tool.latestTestDate
              ? new Date(tool.latestTestDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "-"}
          </p>
        </div>

        {/* 검측 우회 여부 */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-400 font-semibold mb-2">검측 우회 여부</p>
          <DetectionBypassIcon value={tool.detectionBypass} />
        </div>

        {/* 테스트 기능 */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-400 font-semibold mb-1">테스트 기능</p>
          <p>{tool.testFeatures || "-"}</p>
        </div>

        {/* 핵 유형 */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-400 font-semibold mb-1">핵 유형</p>
          <p>
            {(tool.hackType || "일반 핵")
              .replace(" 핵", "")
              .replace("핵", "")}
          </p>
        </div>

      </div>
    </div>
  );
}