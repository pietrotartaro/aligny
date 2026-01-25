"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon, PlusSignIcon, LayoutIcon, PencilEdit01Icon } from "@hugeicons/core-free-icons"

import { ThemeToggle } from "@/components/theme-toggle"
import { FocusToggle } from "@/components/kanban/FocusToggle"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useKanban } from "@/context/kanban-context"
import type { Priority } from "@/lib/kanban/types"

const priorities: Priority[] = ["Low", "Medium", "High"]

type TopbarProps = {
  onNewTask: () => void
}

export function Topbar({ onNewTask }: TopbarProps) {
  const { board, filters, dispatch } = useKanban()
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState(board.title)
  const [resetOpen, setResetOpen] = React.useState(false)

  React.useEffect(() => {
    setTitleDraft(board.title)
  }, [board.title])

  const tags = React.useMemo(() => {
    const tagSet = new Set<string>()
    Object.values(board.tasks).forEach((task) => {
      task.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [board.tasks])

  return (
    <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Team Board</p>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={() => {
                  const nextTitle = titleDraft.trim() || "aligny"
                  dispatch({
                    type: "board/title",
                    payload: { title: nextTitle },
                  })
                  setIsEditingTitle(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const nextTitle = titleDraft.trim() || "aligny"
                    dispatch({
                      type: "board/title",
                      payload: { title: nextTitle },
                    })
                    setIsEditingTitle(false)
                  }
                  if (event.key === "Escape") {
                    setTitleDraft(board.title)
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
                className="h-9 text-2xl font-semibold"
              />
            ) : (
              <>
                <h1 className="text-2xl font-semibold">{board.title}</h1>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                  <span className="sr-only">Edit board title</span>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:max-w-md">
          <div className="relative w-full">
            <HugeiconsIcon
              icon={SearchIcon}
              strokeWidth={2}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
            />
            <Input
              value={filters.query}
              onChange={(event) =>
                dispatch({
                  type: "filters/set",
                  payload: { query: event.target.value },
                })
              }
              placeholder="Search tasks..."
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
              <HugeiconsIcon icon={LayoutIcon} strokeWidth={2} />
              <span className="sr-only">Filters</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Priority</DropdownMenuLabel>
                {priorities.map((priority) => (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={filters.priorities.includes(priority)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...filters.priorities, priority]
                        : filters.priorities.filter((item) => item !== priority)
                      dispatch({
                        type: "filters/set",
                        payload: { priorities: next },
                      })
                    }}
                  >
                    {priority}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Tags</DropdownMenuLabel>
                {tags.length === 0 && (
                  <div className="text-muted-foreground px-2 py-1 text-xs">No tags available</div>
                )}
                {tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...filters.tags, tag]
                        : filters.tags.filter((item) => item !== tag)
                      dispatch({
                        type: "filters/set",
                        payload: { tags: next },
                      })
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
            Reset
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset board?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all tasks from the current board.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch({ type: "board/reset" })
                  setResetOpen(false)
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <FocusToggle />
        <ThemeToggle />
        <Button type="button" onClick={onNewTask}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          New Task
        </Button>
      </div>
    </div>
  )
}
