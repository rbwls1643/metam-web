type Props = {
  color: string | null;
};

const colorMap: Record<
  string,
  {
    wrapper: string;
    dot: string;
    text: string;
  }
> = {
  빨강: {
    wrapper: "border-red-200 bg-red-50",
    dot: "bg-red-500",
    text: "text-red-600",
  },
  주황: {
    wrapper: "border-orange-200 bg-orange-50",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  노랑: {
    wrapper: "border-yellow-200 bg-yellow-50",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },
  초록: {
    wrapper: "border-green-200 bg-green-50",
    dot: "bg-green-500",
    text: "text-green-600",
  },
  파랑: {
    wrapper: "border-blue-200 bg-blue-50",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  남색: {
    wrapper: "border-indigo-200 bg-indigo-50",
    dot: "bg-indigo-500",
    text: "text-indigo-600",
  },
  보라: {
    wrapper: "border-purple-200 bg-purple-50",
    dot: "bg-purple-500",
    text: "text-purple-600",
  },
  흰색: {
    wrapper: "border-slate-200 bg-white",
    dot: "bg-slate-300",
    text: "text-slate-600",
  },
  검정: {
    wrapper: "border-slate-900 bg-slate-900",
    dot: "bg-white",
    text: "text-white",
  },
  기본: {
    wrapper: "border-slate-200 bg-slate-100",
    dot: "bg-slate-400",
    text: "text-slate-600",
  },
};

export default function ColorChip({ color }: Props) {
  const value = color && colorMap[color] ? color : "기본";
  const style = colorMap[value];

  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold ${style.wrapper} ${style.text}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      <span>{value}</span>
    </span>
  );
}