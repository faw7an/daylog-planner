import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastId = 0;
const listeners: Set<() => void> = new Set();
let toasts: Toast[] = [];

function emit() {
  listeners.forEach((fn) => fn());
}

export function addToast(toast: Omit<Toast, "id">) {
  const id = String(++toastId);
  toasts = [...toasts, { ...toast, id }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

export function useToast() {
  const [, setTick] = useState(0);

  useState(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  });

  const toast = useCallback((props: Omit<Toast, "id">) => {
    addToast(props);
  }, []);

  return { toast, toasts };
}
