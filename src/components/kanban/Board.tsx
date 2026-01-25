"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import { Column } from "@/components/kanban/Column"
import { TaskCard } from "@/components/kanban/TaskCard"
import { useKanban } from "@/context/kanban-context"
import { matchesFilters } from "@/lib/kanban/filters"
import type { Task } from "@/lib/kanban/types"

type BoardProps = {
  onEditTask: (task: Task, columnId: string) => void
}

export function Board({ onEditTask }: BoardProps) {
  const { board, filters, focusMode, dispatch } = useKanban()
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id)
    const columnId = event.active.data.current?.columnId
    if (!columnId) return
    const task = board.tasks[taskId]
    if (task) {
      setActiveTask(task)
      setActiveColumnId(columnId)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveColumnId(null)
    if (!over) return

    const activeId = String(active.id)
    const fromColumnId = active.data.current?.columnId
    if (!fromColumnId) return

    const toColumnId = over.data.current?.columnId ?? String(over.id)
    const fromColumn = board.columns.find((col) => col.id === fromColumnId)
    const toColumn = board.columns.find((col) => col.id === toColumnId)
    if (!fromColumn || !toColumn) return

    const fromIndex = fromColumn.taskIds.indexOf(activeId)
    let toIndex = toColumn.taskIds.indexOf(String(over.id))
    if (toIndex < 0) {
      toIndex = toColumn.taskIds.length
    }

    if (fromColumnId === toColumnId) {
      if (fromIndex === toIndex) return
      const reordered = arrayMove(fromColumn.taskIds, fromIndex, toIndex)
      dispatch({
        type: "column/reorder",
        payload: { columnId: fromColumnId, taskIds: reordered },
      })
      return
    }

    dispatch({
      type: "task/move",
      payload: {
        taskId: activeId,
        fromColumnId,
        toColumnId,
        toIndex,
      },
    })
  }

  const handleDragCancel = () => {
    setActiveTask(null)
    setActiveColumnId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:items-start lg:gap-4 lg:overflow-x-hidden lg:px-2">
        {board.columns.map((column) => {
          const visibleTasks = column.taskIds
            .map((id) => board.tasks[id])
            .filter(Boolean)
            .filter((task) => matchesFilters(task, filters))

          return (
            <SortableContext key={column.id} items={visibleTasks.map((task) => task.id)}>
              <Column
                column={column}
                tasks={visibleTasks}
                focusMode={focusMode}
                onEditTask={(task) => onEditTask(task, column.id)}
                onDeleteTask={(taskId) => dispatch({ type: "task/delete", payload: { taskId } })}
                onRenameColumn={(columnId, title) =>
                  dispatch({
                    type: "column/update",
                    payload: { columnId, title },
                  })
                }
              />
            </SortableContext>
          )
        })}
      </div>
      <DragOverlay>
        {activeTask && activeColumnId ? (
          <TaskCard
            task={activeTask}
            columnId={activeColumnId}
            columnTitle={board.columns.find((column) => column.id === activeColumnId)?.title ?? ""}
            focusMode={focusMode}
            onEdit={() => undefined}
            onDelete={() => undefined}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
