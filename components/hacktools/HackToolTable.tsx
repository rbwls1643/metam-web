import { HackTool } from "@/app/page";

type Props = {
  tools: HackTool[];
  onSelect: (tool: HackTool) => void;
};

export default function HackToolTable({ tools, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">UI 색상</th>
            <th className="p-3 text-left">핵툴명</th>
            <th className="p-3 text-left">지역</th>
            <th className="p-3 text-left">최근 테스트일</th>
            <th className="p-3 text-left">검측 우회</th>
            <th className="p-3 text-left">테스트 기능</th>
            <th className="p-3 text-left">핵 유형</th>
          </tr>
        </thead>

        <tbody>
          {tools.map((tool, idx) => (
            <tr
              key={tool.id}
              onClick={() => onSelect(tool)}
              className="border-b hover:bg-slate-50 cursor-pointer"
            >
              <td className="p-3">{idx + 1}</td>

              <td className="p-3">{tool.uiColorTag}</td>

              <td className="p-3 font-semibold">{tool.name}</td>

              <td className="p-3">{tool.region}</td>

              <td className="p-3">
                {tool.latestTestDate || "-"}
              </td>

              <td className="p-3">
                {tool.detectionBypass || "확인 전"}
              </td>

              <td className="p-3">
                {tool.testFeatures || "-"}
              </td>

              <td className="p-3">
                {tool.hackType || "일반 핵"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}