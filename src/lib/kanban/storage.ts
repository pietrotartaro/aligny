"use client"

import type { BoardState } from "@/lib/kanban/types"

const STORAGE_KEY = "aligny-kanban"
const SCHEMA_VERSION = 2

type StoredBoard = {
  version: number
  data: BoardState
}

const seedBoard: BoardState = {
  title: "aligny",
  columns: [
    { id: "backlog", title: "Backlog", taskIds: ["task-1", "task-2"] },
    { id: "in-progress", title: "In Progress", taskIds: ["task-3"] },
    { id: "review", title: "Review", taskIds: [] },
    { id: "done", title: "Done", taskIds: ["task-4"] },
  ],
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Design login flow",
      description: "Wireframe screens and validate copy.",
      priority: "High",
      tags: ["design", "auth"],
      estimate: 5,
      createdAt: new Date().toISOString(),
    },
    "task-2": {
      id: "task-2",
      title: "Set up project linting",
      description: "Align ESLint rules with team conventions.",
      priority: "Medium",
      tags: ["devex"],
      estimate: 3,
      createdAt: new Date().toISOString(),
    },
    "task-3": {
      id: "task-3",
      title: "Implement kanban drag and drop",
      description: "Use @dnd-kit and ensure keyboard support.",
      priority: "High",
      tags: ["frontend"],
      estimate: 8,
      createdAt: new Date().toISOString(),
    },
    "task-4": {
      id: "task-4",
      title: "Ship onboarding checklist",
      description: "Finalize docs and link templates.",
      priority: "Low",
      tags: ["docs"],
      estimate: 2,
      createdAt: new Date().toISOString(),
    },
  },
}

function migrateStoredBoard(stored: StoredBoard): BoardState {
  if (stored.version === SCHEMA_VERSION) {
    return stored.data
  }

  if (stored.version === 1) {
    return {
      title: "aligny",
      columns: stored.data.columns ?? seedBoard.columns,
      tasks: stored.data.tasks ?? seedBoard.tasks,
    }
  }

  return seedBoard
}

export function loadBoardState(): BoardState {
  if (typeof window === "undefined") return seedBoard
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return seedBoard
  try {
    const parsed = JSON.parse(raw) as StoredBoard
    if (!parsed || typeof parsed !== "object") return seedBoard
    if (!("version" in parsed) || !("data" in parsed)) return seedBoard
    return migrateStoredBoard(parsed)
  } catch {
    return seedBoard
  }
}

export function saveBoardState(board: BoardState) {
  if (typeof window === "undefined") return
  const payload: StoredBoard = { version: SCHEMA_VERSION, data: board }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
