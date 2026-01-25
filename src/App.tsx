import * as React from "react"

import { Board } from "@/components/kanban/Board"
import { TaskDialog } from "@/components/kanban/TaskDialog"
import { Topbar } from "@/components/kanban/Topbar"
import { KanbanProvider } from "@/context/kanban-context"
import type { Task } from "@/lib/kanban/types"

export function App() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | undefined>()
  const [editingColumnId, setEditingColumnId] = React.useState<string | undefined>()

  const handleNewTask = () => {
    setEditingTask(undefined)
    setEditingColumnId(undefined)
    setDialogOpen(true)
  }

  const handleEditTask = (task: Task, columnId: string) => {
    setEditingTask(task)
    setEditingColumnId(columnId)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
      setEditingColumnId(undefined)
    }
  }

  return (
    <KanbanProvider>
      <div className="bg-background min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <Topbar onNewTask={handleNewTask} />
          <Board onEditTask={handleEditTask} />
        </div>
      </div>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        initialTask={editingTask}
        initialColumnId={editingColumnId}
      />
    </KanbanProvider>
  )
}

export default App
