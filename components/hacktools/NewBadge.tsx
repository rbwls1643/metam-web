"use client";

type Props = {
  createdAt?: string | null;
};

function isNew(createdAt?: string | null) {
  if (!createdAt) return false;

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;

  const now = Date.now();
  const diff = now - created;
  const sevenDays = 1000 * 60 * 60 * 24 * 7;

  return diff >= 0 && diff <= sevenDays;
}

export default function NewBadge({ createdAt }: Props) {
  if (!isNew(createdAt)) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-[1px] text-[9px] font-bold leading-none text-amber-700 ring-1 ring-amber-200">
      NEW
    </span>
  );
}