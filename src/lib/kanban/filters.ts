"use client"

import type { FilterState, Task } from "@/lib/kanban/types"

export function matchesFilters(task: Task, filters: FilterState) {
  const query = filters.query.trim().toLowerCase()
  const matchesQuery =
    query.length === 0 ||
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query)

  const matchesPriority =
    filters.priorities.length === 0 || filters.priorities.includes(task.priority)

  const matchesTags =
    filters.tags.length === 0 || filters.tags.every((tag) => task.tags.includes(tag))

  return matchesQuery && matchesPriority && matchesTags
}
