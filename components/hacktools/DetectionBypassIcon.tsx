export default function DetectionBypassIcon({
  value,
}: {
  value?: string | null;
}) {
  const isBypass = value === "우회 가능";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isBypass
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span>{isBypass ? "✓" : "✕"}</span>
      <span>{isBypass ? "우회 가능" : "우회 불가능"}</span>
    </span>
  );
}