"use client";

import { DEMO_MODE } from "@/lib/demo";
import { FlaskIcon } from "@phosphor-icons/react";

export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
        <FlaskIcon size={14} weight="fill" />
        Demo Mode — data tidak disimpan
      </div>
    </div>
  );
}
