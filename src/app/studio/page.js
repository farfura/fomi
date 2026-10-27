import { notFound } from "next/navigation";
import { Studio } from "@/features/studio/components/Studio";
import { getProject } from "@/server/services/studio";

export const metadata = {
  title: "Studio",
  description: "Direct, compare and approve takes for every shot in a project.",
};

const DEMO_PROJECT_ID = "bloom-and-field";

export default function StudioPage() {
  const project = getProject(DEMO_PROJECT_ID);
  if (!project) notFound();
  return <Studio initialProject={project} />;
}
