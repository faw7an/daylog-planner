import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        window.location.replace("/dashboard");
      } else {
        window.location.replace("/login");
      }
    }
  }, [user, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-sm text-zinc-400">Loading…</div>
    </div>
  );
}
