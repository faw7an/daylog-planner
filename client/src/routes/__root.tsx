import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

export const Route = createRootRoute({
  component: () => <RootComponent />,
});

function RootComponent() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
