import DetectionBypassIcon from "./DetectionBypassIcon";
import ColorChip from "./ColorChip";

type HackTool = {
  id: number;
  name: string;
  region: string;
  uiColorTag: string;
  latestTestDate?: string | null;
  detectionBypass?: string | null;
  testFeatures?: string | null;
  hackType?: string | null;
};

export default function HackToolCardView({
  tools,
  onSelect,
}: {
  tools: HackTool[];
  onSelect: (tool: HackTool) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={() => onSelect(tool)}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
        >
          {/* 상단 */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-lg font-bold text-slate-800">{tool.name}</p>
              <p className="text-sm text-slate-400">{tool.region}</p>
            </div>
            <ColorChip color={tool.uiColorTag} />
          </div>

          {/* 내용 */}
          <div className="space-y-2 text-sm">

            {/* 날짜 */}
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">최근 테스트일</span>
              <span className="font-medium">
                {tool.latestTestDate
                  ? new Date(tool.latestTestDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </span>
            </div>

            {/* 검측 우회 여부 (아이콘 적용) */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">
                검측 우회 여부
              </span>
              <DetectionBypassIcon value={tool.detectionBypass} />
            </div>

            {/* 테스트 기능 */}
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">테스트 기능</span>
              <span>{tool.testFeatures || "-"}</span>
            </div>

            {/* 핵 유형 */}
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">핵 유형</span>
              <span>
                {(tool.hackType || "일반 핵")
                  .replace(" 핵", "")
                  .replace("핵", "")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}