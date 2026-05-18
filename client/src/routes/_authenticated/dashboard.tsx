import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/daylog/AppHeader";
import { ProgressRing } from "@/components/daylog/ProgressRing";
import { TaskGroupCard, type TaskGroup } from "@/components/daylog/TaskGroupCard";
import {
  TaskGroupCardSkeleton,
  ProgressSkeleton,
} from "@/components/daylog/TaskGroupCardSkeleton";
import { NewGroupSheet } from "@/components/daylog/NewGroupSheet";
import api from "@/lib/api";
import { useState } from "react";
import type { GroupColor } from "@/lib/groupColors";

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

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

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

function DashboardPage() {
  const qc = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: apiGroups = [], isLoading } = useQuery<ApiGroup[]>({
    queryKey: ["tasks", "today"],
    queryFn: async () => {
      const res = await api.get("/tasks/today");
      return res.data;
    },
    retry: false,
  });

  const groups = apiGroups.map(mapGroup);

  const createGroup = useMutation({
    mutationFn: async ({
      title,
      color,
    }: {
      title: string;
      color: GroupColor;
    }) => {
      await api.post("/tasks/groups", { title, color });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  const addTask = useMutation({
    mutationFn: async ({
      groupId,
      title,
    }: {
      groupId: string;
      title: string;
    }) => {
      const res = await api.post("/tasks", { groupId, title });
      return res.data;
    },
    onMutate: async ({ groupId, title }) => {
      await qc.cancelQueries({ queryKey: ["tasks", "today"] });
      const prev = qc.getQueryData<ApiGroup[]>(["tasks", "today"]);
      qc.setQueryData<ApiGroup[]>(["tasks", "today"], (old) =>
        old?.map((g) =>
          g.id === groupId
            ? {
                ...g,
                tasks: [
                  ...g.tasks,
                  {
                    id: "optimistic-" + Date.now(),
                    title,
                    completed: false,
                    carried: false,
                  },
                ],
              }
            : g
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["tasks", "today"], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => {
      await api.patch(`/tasks/${taskId}`, { completed });
    },
    onMutate: async ({ taskId, completed }) => {
      await qc.cancelQueries({ queryKey: ["tasks", "today"] });
      const prev = qc.getQueryData<ApiGroup[]>(["tasks", "today"]);
      qc.setQueryData<ApiGroup[]>(["tasks", "today"], (old) =>
        old?.map((g) => ({
          ...g,
          tasks: g.tasks.map((t) =>
            t.id === taskId ? { ...t, completed } : t
          ),
        }))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["tasks", "today"], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      await api.delete(`/tasks/groups/${groupId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4">
        <AppHeader />
        <ProgressSkeleton />
        <div className="space-y-4">
          <TaskGroupCardSkeleton />
        </div>
      </main>
    );
  }

  const allTasks = groups.flatMap((g) => g.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="max-w-2xl mx-auto px-4">
      <AppHeader />

      {groups.length > 0 && (
        <section className="mb-4 p-5 rounded-2xl bg-card border border-white/5">
          <div className="flex items-center gap-5">
            <ProgressRing percent={percent} size={96} stroke={8} />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                Today's progress
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalCount > 0
                  ? `${completedCount} of ${totalCount} tasks done`
                  : "Add your first task"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4 mb-24">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/50 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Sparkles className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-white font-medium mb-1">No tasks yet</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-[200px]">
              Add your first goal to start planning your day.
            </p>
            <button
              onClick={() => setIsSheetOpen(true)}
              className="px-4 py-2 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Add your first goal
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <TaskGroupCard
              key={group.id}
              group={group}
              onToggleTask={(taskId, completed) =>
                toggleTask.mutate({ taskId, completed })
              }
              onAddTask={(groupId, title) => addTask.mutate({ groupId, title })}
              onDeleteTask={(taskId) => deleteTask.mutate(taskId)}
              onDeleteGroup={(groupId) => deleteGroup.mutate(groupId)}
            />
          ))
        )}
      </section>

      {groups.length > 0 && (
        <button
          onClick={() => setIsSheetOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Add new group"
        >
          <Plus size={24} />
        </button>
      )}

      <NewGroupSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onCreate={(title, color) => createGroup.mutate({ title, color })}
      />
    </main>
  );
}
