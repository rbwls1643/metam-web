import { HackTool } from "@/app/page";

type Props = {
  tools: HackTool[];
  onSelect: (tool: HackTool) => void;
};

export default function HackToolCardView({ tools, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={() => onSelect(tool)}
          className="border rounded-2xl p-4 hover:shadow cursor-pointer bg-white"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-lg">{tool.name}</div>
            <div className="text-xs">{tool.uiColorTag}</div>
          </div>

          <div className="text-sm text-slate-400 mb-3">
            {tool.region}
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">최근 테스트:</span>{" "}
              {tool.latestTestDate || "-"}
            </div>

            <div>
              <span className="text-slate-400">검측 우회:</span>{" "}
              {tool.detectionBypass || "확인 전"}
            </div>

            <div>
              <span className="text-slate-400">테스트 기능:</span>{" "}
              {tool.testFeatures || "-"}
            </div>

            <div>
              <span className="text-slate-400">핵 유형:</span>{" "}
              {tool.hackType || "일반 핵"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}