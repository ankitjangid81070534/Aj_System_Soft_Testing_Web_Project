"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AdminSubmitButton({
  idleLabel,
  pendingLabel = "Saving…",
  compact = false,
}: {
  idleLabel: string;
  pendingLabel?: string;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size={compact ? "sm" : "md"} loading={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
