"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

type Tool = {
  id: number;
  name: string;
  image?: string | null;
};

type Props = {
  tools: Tool[];
};

export default function HackToolCardView({ tools }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

  const openLightbox = (url: string, alt: string) => {
    setLightboxImageUrl(url);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  return (
    <>
      <ImageLightbox
        isOpen={lightboxOpen}
        imageUrl={lightboxImageUrl}
        imageAlt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <div key={tool.id} className="rounded-2xl border p-4">
            {tool.image && (
              <button
                onClick={() => openLightbox(tool.image!, tool.name)}
              >
                <img
                  src={tool.image}
                  className="w-full h-[220px] object-cover rounded-xl"
                />
              </button>
            )}

            <div className="mt-3 font-bold">{tool.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}