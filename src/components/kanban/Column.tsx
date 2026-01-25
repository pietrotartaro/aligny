"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"

import { TaskCard } from "@/components/kanban/TaskCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Column as ColumnType, Task } from "@/lib/kanban/types"

type ColumnProps = {
  column: ColumnType
  tasks: Task[]
  focusMode: boolean
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onRenameColumn: (columnId: string, title: string) => void
}

export function Column({
  column,
  tasks,
  focusMode,
  onEditTask,
  onDeleteTask,
  onRenameColumn,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id, type: "column" },
  })

  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(column.title)

  React.useEffect(() => {
    setTitle(column.title)
  }, [column.title])

  const handleTitleCommit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(column.title)
    } else if (trimmed !== column.title) {
      onRenameColumn(column.id, trimmed)
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/30 ring-foreground/10 flex min-w-[280px] flex-col gap-3 self-start rounded-2xl p-3 ring-1 lg:min-w-0",
        isOver && "bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleCommit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleTitleCommit()
              }
            }}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <span className="text-muted-foreground text-xs">{tasks.length}</span>
          </div>
        )}
        <Button type="button" variant="ghost" size="xs" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-muted-foreground flex min-h-24 items-center justify-center rounded-xl border border-dashed p-4 text-xs">
            No tasks in {column.title}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              columnTitle={column.title}
              focusMode={focusMode}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
