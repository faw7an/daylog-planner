import { useToast } from "./use-toast";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 text-sm shadow-lg border animate-in slide-in-from-right ${
            t.variant === "destructive"
              ? "bg-red-950 border-red-800 text-red-200"
              : "bg-zinc-800 border-zinc-700 text-white"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
