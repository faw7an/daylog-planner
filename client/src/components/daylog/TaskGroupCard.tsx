import { useState } from "react";
import { Check, Trash2, Plus, CornerDownLeft } from "lucide-react";
import { colorVar } from "@/lib/groupColors";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  carried: boolean;
}

export interface TaskGroup {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface Props {
  group: TaskGroup;
  readOnly?: boolean;
  onToggleTask?: (taskId: string, completed: boolean) => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onAddTask?: (groupId: string, text: string) => void;
}

export function TaskGroupCard({
  group,
  readOnly,
  onToggleTask,
  onDeleteTask,
  onDeleteGroup,
  onAddTask,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const accent = colorVar(group.color);

  function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && onAddTask) {
      onAddTask(group.id, text.trim());
      setText("");
      setAdding(false);
    }
  }

  return (
    <div
      className={`relative rounded-xl bg-card p-4 hairline ${readOnly ? "opacity-70" : ""}`}
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{group.title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
            {group.tasks.filter((t) => t.completed).length}/{group.tasks.length}
          </span>
        </div>
        {!readOnly && onDeleteGroup && (
          <button
            onClick={() => onDeleteGroup(group.id)}
            aria-label="Delete group"
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <ul className="space-y-1.5">
        {group.tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-md px-1 py-1.5">
            <button
              disabled={readOnly}
              onClick={() => onToggleTask?.(t.id, !t.completed)}
              aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-colors hairline ${
                t.completed
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-accent"
              } ${readOnly ? "cursor-default" : ""}`}
            >
              {t.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </button>
            <span
              onClick={() =>
                !readOnly && onToggleTask?.(t.id, !t.completed)
              }
              className={`flex-1 text-sm cursor-pointer select-none ${
                t.completed ? "text-muted-foreground line-through" : "text-foreground"
              } ${readOnly ? "cursor-default" : ""}`}
            >
              {t.text}
            </span>
            {t.carried && !t.completed && (
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                <CornerDownLeft className="h-3 w-3" />
                Carried
              </span>
            )}
            {!readOnly && onDeleteTask && (
              <button
                onClick={() => onDeleteTask(t.id)}
                aria-label="Delete task"
                className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && (
        <div className="mt-2">
          {adding ? (
            <form onSubmit={submitTask} className="flex items-center gap-2 px-1">
              <input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => {
                  if (!text.trim()) setAdding(false);
                }}
                placeholder="Type a task and press Enter"
                className="flex-1 rounded-md bg-input px-3 py-1.5 text-sm outline-none ring-1 ring-transparent focus:ring-primary"
              />
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-1 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add task...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
