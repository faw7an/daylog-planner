interface TaskGroupCardSkeletonProps {
  taskCount?: number;
}

export function TaskGroupCardSkeleton({ taskCount = 3 }: TaskGroupCardSkeletonProps) {
  return (
    <div className="relative rounded-xl bg-card p-4 hairline animate-pulse">
      {/* Colored left border placeholder */}
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-muted-foreground/20" />

      {/* Header: title + badge + delete button */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded bg-muted-foreground/15" />
          <div className="h-4 w-8 rounded-full bg-muted-foreground/10" />
        </div>
        <div className="h-4 w-4 rounded bg-muted-foreground/10" />
      </div>

      {/* Task rows */}
      <ul className="space-y-1.5">
        {Array.from({ length: taskCount }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-md px-1 py-1.5">
            {/* Checkbox placeholder */}
            <div className="h-5 w-5 flex-shrink-0 rounded-md bg-muted-foreground/10" />
            {/* Text placeholder — varying widths */}
            <div
              className="h-3.5 rounded bg-muted-foreground/10"
              style={{ width: `${65 + (i % 3) * 15}%` }}
            />
          </li>
        ))}
      </ul>

      {/* Add task button placeholder */}
      <div className="mt-2 flex items-center gap-1.5 px-1 py-1.5">
        <div className="h-3.5 w-3.5 rounded bg-muted-foreground/10" />
        <div className="h-3 w-16 rounded bg-muted-foreground/10" />
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <section className="mb-6 flex items-center gap-5 rounded-xl bg-card p-5 hairline animate-pulse">
      {/* Ring placeholder */}
      <div className="h-[120px] w-[120px] flex-shrink-0 rounded-full bg-muted-foreground/10" />
      <div className="space-y-2">
        <div className="h-3.5 w-28 rounded bg-muted-foreground/15" />
        <div className="h-6 w-36 rounded bg-muted-foreground/10" />
      </div>
    </section>
  );
}
