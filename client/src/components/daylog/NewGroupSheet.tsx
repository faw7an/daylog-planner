import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { GROUP_COLORS, type GroupColor } from "@/lib/groupColors";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, color: GroupColor) => void;
}

export function NewGroupSheet({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<GroupColor>("purple");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), color);
    setTitle("");
    setColor("purple");
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl bg-card p-5 hairline md:rounded-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New goal</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Code on Apartment 4hrs"
            className="w-full rounded-md bg-input px-3 py-2.5 text-sm outline-none ring-1 ring-transparent focus:ring-primary"
          />
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Color
            </p>
            <div className="flex gap-3">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  aria-label={c.key}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c.key ? "scale-110 ring-2 ring-offset-2 ring-offset-card" : ""
                  }`}
                  style={{
                    backgroundColor: c.varName,
                    boxShadow: color === c.key ? `0 0 0 2px ${c.varName}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Create goal
          </button>
        </form>
      </div>
    </div>
  );
}
