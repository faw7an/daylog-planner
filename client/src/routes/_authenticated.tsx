import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  const isDashboard = routerState.location.pathname === "/dashboard";
  const isHistory = routerState.location.pathname === "/history";

  return (
    <div className="min-h-screen bg-zinc-950 pb-24" style={{ paddingTop: "calc(2.5rem + env(safe-area-inset-top))" }}>
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-white/10 px-6 pt-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isDashboard ? "text-purple-400" : "text-zinc-500"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isHistory ? "text-purple-400" : "text-zinc-500"
            }`}
          >
            <Clock className="h-5 w-5" />
            History
          </Link>
        </div>
      </nav>
    </div>
  );
}
