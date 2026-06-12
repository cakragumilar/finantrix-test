import { DEMO_LESSONS } from "@/lib/mock-data";
import LessonPlayerClient from "./lesson-player-client";

export function generateStaticParams() {
  return DEMO_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default function LessonPlayerPage() {
  return <LessonPlayerClient />;
}
