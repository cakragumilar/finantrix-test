"use client";

/*
  STORY MODE (Mode Cerita) - SCAFFOLD ONLY.
  Concept: office tycoon idle game; time progresses, accounting questions
  pop up as in-game events that affect cash/staff/office level.

  Data model is ready: `storyState/{uid}` (see src/lib/types.ts) with
  security rules in place. Build order (TODO):
  1. Tick engine (offline-accumulating, lastSeen timestamp)
  2. Event queue: pull questions by difficulty as randomized events
  3. Office scene rendering + upgrade shop priced in story cash
  4. Reward loop: correct answers compound cash; wrong answers cost staff morale
*/

import { BuildingOfficeIcon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui";

export default function CeritaPage() {
  return (
    <EmptyState
      icon={<BuildingOfficeIcon size={48} weight="bold" />}
      title="Mode Cerita segera hadir"
      body="Bangun kantor akuntanmu sendiri sambil belajar. Sedang kami siapkan."
    />
  );
}
