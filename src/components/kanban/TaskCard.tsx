"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/kanban/types"

type TaskCardProps = {
  task: Task
  columnId: string
  columnTitle: string
  focusMode: boolean
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityStyles: Record<Task["priority"], string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-secondary text-secondary-foreground",
  High: "bg-destructive/10 text-destructive",
}

export function TaskCard({
  task,
  columnId,
  columnTitle,
  focusMode,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { columnId, type: "task" },
  })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("bg-card/80 hover:bg-card transition-colors", isDragging && "opacity-60")}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">{columnTitle}</Badge>
          </div>
          <Button size="xs" variant="ghost" type="button" onClick={() => onEdit(task)}>
            Edit
          </Button>
        </div>
        <CardTitle className="text-sm leading-snug">{task.title}</CardTitle>
      </CardHeader>
      {!focusMode && (
        <CardContent className="text-muted-foreground space-y-3 text-xs">
          <p className="text-foreground/80">{task.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
      {!focusMode && (
        <CardFooter className="text-muted-foreground justify-between text-xs">
          <span>{task.estimate} pts</span>
          <span>
            {new Date(task.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            })}
          </span>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" size="xs" />}>
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  )
}
