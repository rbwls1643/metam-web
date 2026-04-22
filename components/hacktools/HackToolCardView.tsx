"use client";

import HackToolCard from "./HackToolCard";

type HackToolImage = {
  id: number;
  hackToolId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  caption: string | null;
  uploadedAt: string | null;
};

type HackTool = {
  id: number;
  name: string;
  mainToolName?: string | null;
  region?: string | null;
  uiColorTag?: string | null;
  downloadUrl?: string | null;
  creatorUrl?: string | null;
  saleUrl?: string | null;
  latestTestDate?: string | null;
  createdAt?: string | null;
  isNew?: boolean;
  images?: HackToolImage[];
};

type Props = {
  tools: HackTool[];
};

export default function HackToolCardView({ tools }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {tools.map((tool) => (
        <HackToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}