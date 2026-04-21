"use client";

type Props = {
  url: string | null;
};

function getDomain(url: string) {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export default function ExternalDomainLink({ url }: Props) {
  if (!url) {
    return <span className="text-slate-400">-</span>;
  }

  const safeUrl = url.startsWith("http") ? url : `https://${url}`;
  const domain = getDomain(url);

  const handleCopy = async (
    e: React.MouseEvent<HTMLButtonElement>,
    value: string
  ) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-0 max-w-[180px] items-center gap-1 truncate font-medium text-blue-600 hover:text-blue-700 hover:underline"
        title={url}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate">{domain}</span>
        <span className="text-xs">↗</span>
      </a>

      <button
        type="button"
        onClick={(e) => handleCopy(e, domain)}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        title="도메인 복사"
        aria-label="도메인 복사"
      >
        <CopyIcon />
      </button>
    </div>
  );
}