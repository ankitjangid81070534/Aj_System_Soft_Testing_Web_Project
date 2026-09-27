"use client";

import { useRouter } from "next/navigation";
import { findTool } from "@/lib/ai/tools";
import { ToolRunner } from "./ToolRunner";

/** Standalone (indexable) tool page: "All tools" goes back to the catalogue. */
export function ToolPageRunner({ toolId, signedIn }: { toolId: string; signedIn: boolean }) {
  const router = useRouter();
  const tool = findTool(toolId);
  if (!tool) return null;
  return <ToolRunner tool={tool} signedIn={signedIn} onBack={() => router.push("/ai-tools")} />;
}
