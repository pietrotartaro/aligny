"use client"

export type Priority = "Low" | "Medium" | "High"

export type Tag = string

export type Task = {
  id: string
  title: string
  description: string
  priority: Priority
  tags: Tag[]
  estimate: number
  createdAt: string
}

export type Column = {
  id: string
  title: string
  taskIds: string[]
}

export type BoardState = {
  title: string
  columns: Column[]
  tasks: Record<string, Task>
}

export type FilterState = {
  query: string
  priorities: Priority[]
  tags: Tag[]
}

export type KanbanState = {
  board: BoardState
  filters: FilterState
  focusMode: boolean
}
