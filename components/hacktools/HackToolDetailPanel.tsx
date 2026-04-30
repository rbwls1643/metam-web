import { HackTool } from "@/app/page";

type Props = {
  tool: HackTool | null;
};

export default function HackToolDetailPanel({ tool }: Props) {
  if (!tool) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold">{tool.name}</div>

      <div className="text-sm text-slate-400">
        {tool.region}
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-slate-400">최근 테스트:</span>{" "}
          {tool.latestTestDate || "-"}
        </div>

        <div>
          <span className="text-slate-400">검측 우회 여부:</span>{" "}
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
  );
}