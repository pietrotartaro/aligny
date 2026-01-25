"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useKanban } from "@/context/kanban-context"
import type { Priority, Task } from "@/lib/kanban/types"

const priorities: Priority[] = ["Low", "Medium", "High"]

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}`
}

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTask?: Task
  initialColumnId?: string
}

export function TaskDialog({ open, onOpenChange, initialTask, initialColumnId }: TaskDialogProps) {
  const { board, dispatch } = useKanban()
  const isEdit = Boolean(initialTask)
  const columns = board.columns

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState<Priority>("Medium")
  const [estimate, setEstimate] = React.useState("3")
  const [tags, setTags] = React.useState("")
  const [columnId, setColumnId] = React.useState(initialColumnId ?? columns[0]?.id ?? "")

  React.useEffect(() => {
    if (!open) return
    setTitle(initialTask?.title ?? "")
    setDescription(initialTask?.description ?? "")
    setPriority(initialTask?.priority ?? "Medium")
    setEstimate(initialTask ? `${initialTask.estimate}` : "3")
    setTags(initialTask?.tags.join(", ") ?? "")
    setColumnId(
      initialColumnId ??
        columns.find((col) => col.taskIds.includes(initialTask?.id ?? ""))?.id ??
        columns[0]?.id ??
        ""
    )
  }, [open, initialTask, initialColumnId, columns])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const normalizedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (isEdit && initialTask) {
      dispatch({
        type: "task/update",
        payload: {
          taskId: initialTask.id,
          updates: {
            title: trimmedTitle,
            description: description.trim(),
            priority,
            tags: normalizedTags,
            estimate: Number(estimate) || 0,
          },
          columnId,
        },
      })
    } else {
      const task: Task = {
        id: createTaskId(),
        title: trimmedTitle,
        description: description.trim(),
        priority,
        tags: normalizedTags,
        estimate: Number(estimate) || 0,
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: "task/create", payload: { task, columnId } })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            Keep tasks lean and actionable for quick progress updates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Refine story acceptance criteria"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <Textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What needs to be done?"
                rows={4}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                  <SelectTrigger id="task-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {priorities.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="task-estimate">Estimate (pts)</FieldLabel>
                <Input
                  id="task-estimate"
                  type="number"
                  min={0}
                  value={estimate}
                  onChange={(event) => setEstimate(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="task-tags">Tags</FieldLabel>
                <Input
                  id="task-tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="frontend, api, docs"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <Select value={columnId} onValueChange={(value) => setColumnId(value ?? "")}>
                  <SelectTrigger id="task-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
