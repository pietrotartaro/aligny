"use client"

import { Button } from "@/components/ui/button"
import { useKanban } from "@/context/kanban-context"

export function FocusToggle() {
  const { focusMode, dispatch } = useKanban()

  return (
    <Button
      type="button"
      variant={focusMode ? "default" : "outline"}
      size="sm"
      aria-pressed={focusMode}
      onClick={() => dispatch({ type: "focus/toggle" })}
    >
      Focus
    </Button>
  )
}
