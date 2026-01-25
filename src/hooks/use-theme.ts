"use client"

import * as React from "react"

const STORAGE_KEY = "aligny-theme"

export type Theme = "light" | "dark" | "system"

function getSystemTheme() {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    return stored ?? "system"
  })

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const root = window.document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  React.useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const nextTheme = media.matches ? "dark" : "light"
      const root = window.document.documentElement
      root.classList.toggle("dark", nextTheme === "dark")
    }
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme])

  return { theme, setTheme, resolvedTheme }
}
