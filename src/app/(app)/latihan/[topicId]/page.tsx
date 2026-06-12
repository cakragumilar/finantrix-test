import { DEMO_TOPICS } from "@/lib/mock-data";
import DrillPlayerClient from "./drill-player-client";

export function generateStaticParams() {
  return DEMO_TOPICS.map((t) => ({ topicId: t.id }));
}

export default function DrillPlayerPage() {
  return <DrillPlayerClient />;
}
