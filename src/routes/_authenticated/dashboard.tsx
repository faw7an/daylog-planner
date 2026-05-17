import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/daylog/AppHeader";
import { BottomNav } from "@/components/daylog/BottomNav";
import { ProgressRing } from "@/components/daylog/ProgressRing";
import { TaskGroupCard, type TaskGroup } from "@/components/daylog/TaskGroupCard";
import { NewGroupSheet } from "@/components/daylog/NewGroupSheet";
import { carryForwardTasks } from "@/lib/carryForward.functions";
import { todayISO } from "@/lib/dateUtils";
import type { GroupColor } from "@/lib/groupColors";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

async function fetchToday(): Promise<TaskGroup[]> {
  const today = todayISO();
  const { data: groups, error: gErr } = await supabase
    .from("task_groups")
    .select("id, title, color")
    .order("created_at", { ascending: true });
  if (gErr) throw gErr;
  if (!groups?.length) return [];

  const { data: tasks, error: tErr } = await supabase
    .from("tasks")
    .select("id, group_id, text, completed, carried")
    .eq("due_date", today)
    .order("created_at", { ascending: true });
  if (tErr) throw tErr;

  return groups.map((g) => ({
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
  }));
}

function DashboardPage() {
  const qc = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const carryFn = useServerFn(carryForwardTasks);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  // Run carry-forward once on mount
  useEffect(() => {
    carryFn({})
      .then(() => qc.invalidateQueries({ queryKey: ["today"] }))
      .catch((e) => console.warn("carry-forward failed", e));
  }, [carryFn, qc]);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["today"],
    queryFn: fetchToday,
  });

  const { total, done, percent } = useMemo(() => {
    const all = groups.flatMap((g) => g.tasks);
    const total = all.length;
    const done = all.filter((t) => t.completed).length;
    return { total, done, percent: total ? (done / total) * 100 : 0 };
  }, [groups]);

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: ["today"] });
      const prev = qc.getQueryData<TaskGroup[]>(["today"]);
      qc.setQueryData<TaskGroup[]>(["today"], (old) =>
        (old ?? []).map((g) => ({
          ...g,
          tasks: g.tasks.map((t) => (t.id === id ? { ...t, completed } : t)),
        })),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["today"], ctx.prev);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }),
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }),
  });

  const addTask = useMutation({
    mutationFn: async ({ groupId, text }: { groupId: string; text: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("tasks").insert({
        group_id: groupId,
        user_id: u.user.id,
        text,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }),
  });

  const createGroup = useMutation({
    mutationFn: async ({ title, color }: { title: string; color: GroupColor }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("task_groups").insert({
        title,
        color,
        user_id: u.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["today"] }),
  });

  const isEmpty = !isLoading && groups.length === 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      <AppHeader email={email} />
      <main className="mx-auto w-full max-w-2xl px-5">
        {/* Progress */}
        {!isEmpty && (
          <section className="mb-6 flex items-center gap-5 rounded-xl bg-card p-5 hairline">
            <ProgressRing percent={percent} />
            <div>
              <p className="text-sm text-muted-foreground">Today's progress</p>
              <p className="text-lg font-medium">
                {done} of {total} tasks done
              </p>
            </div>
          </section>
        )}

        {/* Groups */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-card hairline" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-6 py-16 text-center hairline">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-medium">No tasks planned yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start your day by setting a goal.
            </p>
            <button
              onClick={() => setOpenSheet(true)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Add your first goal <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <TaskGroupCard
                key={g.id}
                group={g}
                onToggleTask={(id, completed) => toggleTask.mutate({ id, completed })}
                onDeleteTask={(id) => deleteTask.mutate(id)}
                onDeleteGroup={(id) => deleteGroup.mutate(id)}
                onAddTask={(groupId, text) => addTask.mutate({ groupId, text })}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {!isEmpty && (
        <button
          onClick={() => setOpenSheet(true)}
          aria-label="Add goal"
          className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 md:bottom-8"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <BottomNav />

      <NewGroupSheet
        open={openSheet}
        onClose={() => setOpenSheet(false)}
        onCreate={(title, color) => createGroup.mutate({ title, color })}
      />
    </div>
  );
}
