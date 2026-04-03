"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { Card } from "@heroui/react"
import { Button } from "@heroui/react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      const id = Date.now().toString()
      setToasts((prev) => [...prev, { id, type, message }])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast],
  )

  const value: ToastContextType = {
    showToast,
    success: (msg, duration) => showToast("success", msg, duration),
    error: (msg, duration) => showToast("error", msg, duration),
    info: (msg, duration) => showToast("info", msg, duration),
    warning: (msg, duration) => showToast("warning", msg, duration),
  }

  const getColorByType = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getIconByType = (type: ToastType) => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "info":
        return "ℹ"
      default:
        return "•"
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Card
            key={toast.id}
            className={`${getColorByType(toast.type)} text-white p-4 shadow-lg animate-in fade-in slide-in-from-top-2`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg font-bold mt-0.5">{getIconByType(toast.type)}</span>
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <Button
                isIconOnly
                size="sm"
                className="bg-white/20 hover:bg-white/30"
                onClick={() => removeToast(toast.id)}
              >
                ✕
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
