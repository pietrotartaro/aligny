"use client"

import * as React from "react"

import type { BoardState, FilterState, KanbanState, Task } from "@/lib/kanban/types"
import { loadBoardState, saveBoardState } from "@/lib/kanban/storage"

type Action =
  | { type: "task/create"; payload: { task: Task; columnId: string } }
  | {
      type: "task/update"
      payload: { taskId: string; updates: Partial<Task>; columnId?: string }
    }
  | { type: "task/delete"; payload: { taskId: string } }
  | {
      type: "task/move"
      payload: {
        taskId: string
        fromColumnId: string
        toColumnId: string
        toIndex: number
      }
    }
  | {
      type: "column/reorder"
      payload: { columnId: string; taskIds: string[] }
    }
  | { type: "filters/set"; payload: Partial<FilterState> }
  | { type: "focus/toggle" }
  | { type: "column/update"; payload: { columnId: string; title: string } }
  | { type: "column/add"; payload: { title: string } }
  | { type: "board/title"; payload: { title: string } }
  | { type: "board/reset" }

const initialFilters: FilterState = {
  query: "",
  priorities: [],
  tags: [],
}

const initialState: KanbanState = {
  board: loadBoardState(),
  filters: initialFilters,
  focusMode: false,
}

function createColumnId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24)
}

function reducer(state: KanbanState, action: Action): KanbanState {
  switch (action.type) {
    case "task/create": {
      const { task, columnId } = action.payload
      const column = state.board.columns.find((col) => col.id === columnId)
      if (!column) return state

      return {
        ...state,
        board: {
          ...state.board,
          tasks: {
            ...state.board.tasks,
            [task.id]: task,
          },
          columns: state.board.columns.map((col) =>
            col.id === columnId ? { ...col, taskIds: [task.id, ...col.taskIds] } : col
          ),
        },
      }
    }
    case "task/update": {
      const { taskId, updates, columnId } = action.payload
      const task = state.board.tasks[taskId]
      if (!task) return state

      let nextBoard: BoardState = {
        ...state.board,
        tasks: {
          ...state.board.tasks,
          [taskId]: { ...task, ...updates },
        },
      }

      if (columnId) {
        const fromColumn = state.board.columns.find((col) => col.taskIds.includes(taskId))
        const toColumn = state.board.columns.find((col) => col.id === columnId)
        if (fromColumn && toColumn) {
          nextBoard = {
            ...nextBoard,
            columns: state.board.columns.map((col) => {
              if (col.id === fromColumn.id) {
                return {
                  ...col,
                  taskIds: col.taskIds.filter((id) => id !== taskId),
                }
              }
              if (col.id === toColumn.id) {
                return { ...col, taskIds: [taskId, ...col.taskIds] }
              }
              return col
            }),
          }
        }
      }

      return { ...state, board: nextBoard }
    }
    case "task/delete": {
      const { taskId } = action.payload
      if (!state.board.tasks[taskId]) return state
      const { [taskId]: _, ...restTasks } = state.board.tasks
      return {
        ...state,
        board: {
          ...state.board,
          tasks: restTasks,
          columns: state.board.columns.map((col) => ({
            ...col,
            taskIds: col.taskIds.filter((id) => id !== taskId),
          })),
        },
      }
    }
    case "task/move": {
      const { taskId, fromColumnId, toColumnId, toIndex } = action.payload
      if (!state.board.tasks[taskId]) return state
      return {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => {
            if (col.id === fromColumnId) {
              return {
                ...col,
                taskIds: col.taskIds.filter((id) => id !== taskId),
              }
            }
            if (col.id === toColumnId) {
              const nextTaskIds = [...col.taskIds]
              nextTaskIds.splice(toIndex, 0, taskId)
              return { ...col, taskIds: nextTaskIds }
            }
            return col
          }),
        },
      }
    }
    case "column/reorder": {
      const { columnId, taskIds } = action.payload
      return {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId ? { ...col, taskIds } : col
          ),
        },
      }
    }
    case "filters/set":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }
    case "focus/toggle":
      return { ...state, focusMode: !state.focusMode }
    case "column/update": {
      const { columnId, title } = action.payload
      return {
        ...state,
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId ? { ...col, title } : col
          ),
        },
      }
    }
    case "column/add": {
      const idBase = createColumnId(action.payload.title) || "column"
      let suffix = 1
      let columnId = idBase
      while (state.board.columns.some((col) => col.id === columnId)) {
        suffix += 1
        columnId = `${idBase}-${suffix}`
      }
      return {
        ...state,
        board: {
          ...state.board,
          columns: [
            ...state.board.columns,
            { id: columnId, title: action.payload.title, taskIds: [] },
          ],
        },
      }
    }
    case "board/title": {
      return {
        ...state,
        board: {
          ...state.board,
          title: action.payload.title,
        },
      }
    }
    case "board/reset": {
      return {
        ...state,
        board: {
          ...state.board,
          tasks: {},
          columns: state.board.columns.map((column) => ({
            ...column,
            taskIds: [],
          })),
        },
      }
    }
    default:
      return state
  }
}

type KanbanContextValue = KanbanState & {
  dispatch: React.Dispatch<Action>
}

const KanbanContext = React.createContext<KanbanContextValue | null>(null)

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    saveBoardState(state.board)
  }, [state.board])

  return <KanbanContext.Provider value={{ ...state, dispatch }}>{children}</KanbanContext.Provider>
}

export function useKanban() {
  const context = React.useContext(KanbanContext)
  if (!context) {
    throw new Error("useKanban must be used within KanbanProvider")
  }
  return context
}
