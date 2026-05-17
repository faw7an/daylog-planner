import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/daylog/AppHeader";
import { BottomNav } from "@/components/daylog/BottomNav";
import { ProgressRing } from "@/components/daylog/ProgressRing";
import { TaskGroupCard, type TaskGroup } from "@/components/daylog/TaskGroupCard";
import {
  addDaysISO,
  formatHistoryLabel,
  formatLongDate,
  todayISO,
} from "@/lib/dateUtils";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

async function fetchDate(date: string): Promise<TaskGroup[]> {
  const { data: groups, error: gErr } = await supabase
    .from("task_groups")
    .select("id, title, color")
    .order("created_at", { ascending: true });
  if (gErr) throw gErr;
  if (!groups?.length) return [];

  const { data: tasks, error: tErr } = await supabase
    .from("tasks")
    .select("id, group_id, text, completed, carried")
    .eq("due_date", date)
    .order("created_at", { ascending: true });
  if (tErr) throw tErr;

  return groups
    .map((g) => ({
      id: g.id,
      title: g.title,
      color: g.color,
      tasks: (tasks ?? [])
        .filter((t) => t.group_id === g.id)
        .map((t) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          carried: t.carried,
        })),
    }))
    .filter((g) => g.tasks.length > 0);
}

function HistoryPage() {
  const today = todayISO();
  const [date, setDate] = useState(() => addDaysISO(today, -1));
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["history", date],
    queryFn: () => fetchDate(date),
  });

  const { total, done, percent } = useMemo(() => {
    const all = groups.flatMap((g) => g.tasks);
    const total = all.length;
    const done = all.filter((t) => t.completed).length;
    return { total, done, percent: total ? (done / total) * 100 : 0 };
  }, [groups]);

  const canForward = date < today;
  const headerSub = `${formatHistoryLabel(date)} · ${formatLongDate(date).split(",")[1]?.trim() ?? ""}`;

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader email={email} subtitle={headerSub} />
      <main className="mx-auto w-full max-w-2xl px-5">
        {/* Date nav */}
        <div className="mb-5 flex items-center justify-between rounded-xl bg-card p-2 hairline">
          <button
            onClick={() => setDate(addDaysISO(date, -1))}
            aria-label="Previous day"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center text-sm font-medium">
            {formatHistoryLabel(date)} ·{" "}
            <span className="text-muted-foreground">
              {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <button
            onClick={() => canForward && setDate(addDaysISO(date, 1))}
            disabled={!canForward}
            aria-label="Next day"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        {groups.length > 0 && (
          <section className="mb-6 flex items-center gap-5 rounded-xl bg-card p-5 hairline">
            <ProgressRing percent={percent} />
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-lg font-medium">
                {done} of {total} done
              </p>
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-card hairline" />
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-6 py-16 text-center hairline">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nothing logged this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <TaskGroupCard key={g.id} group={g} readOnly />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
