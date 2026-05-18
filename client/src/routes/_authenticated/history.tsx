import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { AppHeader } from "@/components/daylog/AppHeader";
import { TaskGroupCard, type TaskGroup } from "@/components/daylog/TaskGroupCard";
import { TaskGroupCardSkeleton } from "@/components/daylog/TaskGroupCardSkeleton";
import api from "@/lib/api";
import { useState, useMemo, useRef } from "react";

interface ApiTask {
  id: string;
  title: string;
  completed: boolean;
  carried: boolean;
}

interface ApiGroup {
  id: string;
  title: string;
  color: string;
  tasks: ApiTask[];
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function isToday(iso: string) {
  return iso === toISODate(new Date());
}

function mapGroup(g: ApiGroup): TaskGroup {
  return {
    id: g.id,
    title: g.title,
    color: g.color,
    tasks: g.tasks.map((t) => ({
      id: t.id,
      text: t.title,
      completed: t.completed,
      carried: t.carried,
    })),
  };
}

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const today = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { data: dates = [] } = useQuery<string[]>({
    queryKey: ["tasks", "dates"],
    queryFn: async () => {
      const res = await api.get("/tasks/dates");
      return res.data;
    },
  });

  const { data: apiGroups = [], isLoading } = useQuery<ApiGroup[]>({
    queryKey: ["tasks", "history", selectedDate],
    queryFn: async () => {
      const res = await api.get("/tasks/history", {
        params: { date: selectedDate },
      });
      return res.data;
    },
    enabled: !!selectedDate,
  });

  const groups = apiGroups.map(mapGroup);

  const allTasks = groups.flatMap((g) => g.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;

  const currentIndex = dates.indexOf(selectedDate);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < dates.length - 1;

  function goPrev() {
    if (hasPrev) setSelectedDate(dates[currentIndex - 1]);
  }
  function goNext() {
    if (hasNext) setSelectedDate(dates[currentIndex + 1]);
  }

  const dateOptions = useMemo(() => {
    return dates.map((d) => ({
      value: d,
      label: isToday(d) ? "Today" : formatDate(d),
    }));
  }, [dates]);

  return (
    <main className="max-w-2xl mx-auto px-4">
      <AppHeader />

      <section className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous day"
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative flex-1 flex items-center justify-center gap-2 max-w-[260px]">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 appearance-none bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center cursor-pointer focus:outline-none focus:border-purple-600"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Pick a date"
            />
            <label
              onClick={() => (dateInputRef.current as any)?.showPicker?.()}
              className="cursor-pointer p-1 rounded hover:bg-zinc-800 text-muted-foreground hover:text-white transition-colors flex-shrink-0"
            >
              <Calendar className="h-4 w-4" />
            </label>
          </div>

          <button
            onClick={goNext}
            disabled={!hasNext}
            aria-label="Next day"
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span />
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {completedCount} task{completedCount !== 1 ? "s" : ""} completed
            </span>
          )}
        </div>
      </section>

      <section className="space-y-4 mb-24">
        {isLoading ? (
          <TaskGroupCardSkeleton />
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/50 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Calendar className="text-zinc-500" size={24} />
            </div>
            <p className="text-zinc-400 text-sm">Nothing logged this day.</p>
          </div>
        ) : (
          groups.map((group) => (
            <TaskGroupCard key={group.id} group={group} readOnly />
          ))
        )}
      </section>
    </main>
  );
}
