// Toast notification manager
type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// This is a utility for managing toast state
// You'll use this with a context or Zustand store for global state management
export class ToastManager {
  private static listeners: Set<(toast: Toast) => void> = new Set()
  private static removeListeners: Set<(id: string) => void> = new Set()

  static subscribe(listener: (toast: Toast) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  static subscribeRemove(listener: (id: string) => void) {
    this.removeListeners.add(listener)
    return () => this.removeListeners.delete(listener)
  }

  static show(type: ToastType, message: string, duration = 3000) {
    const id = Date.now().toString()
    const toast: Toast = { id, type, message, duration }

    this.listeners.forEach((listener) => listener(toast))

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  }

  static success(message: string, duration?: number) {
    return this.show("success", message, duration)
  }

  static error(message: string, duration?: number) {
    return this.show("error", message, duration)
  }

  static info(message: string, duration?: number) {
    return this.show("info", message, duration)
  }

  static warning(message: string, duration?: number) {
    return this.show("warning", message, duration)
  }

  static remove(id: string) {
    this.removeListeners.forEach((listener) => listener(id))
  }
}
