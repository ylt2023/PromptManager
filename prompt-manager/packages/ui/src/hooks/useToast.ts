import { useState, useCallback, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []
let counter = 0

function emit() {
  listeners.forEach((l) => l([...toasts]))
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = `toast-${++counter}`
  toasts = [...toasts, { ...toast, id }]
  emit()
  const duration = toast.duration ?? 4000
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export const toast = {
  success: (message: string, opts?: Partial<Toast>) => addToast({ type: 'success', message, ...opts }),
  error: (message: string, opts?: Partial<Toast>) => addToast({ type: 'error', message, duration: 6000, ...opts }),
  warning: (message: string, opts?: Partial<Toast>) => addToast({ type: 'warning', message, ...opts }),
  info: (message: string, opts?: Partial<Toast>) => addToast({ type: 'info', message, ...opts }),
  dismiss: removeToast,
}

export function useToasts() {
  const [items, setItems] = useState(toasts)
  useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter((l) => l !== setItems) }
  }, [])
  return { toasts: items, dismiss: removeToast }
}
