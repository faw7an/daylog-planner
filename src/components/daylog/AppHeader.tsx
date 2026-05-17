import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatLongDate, todayISO } from "@/lib/dateUtils";
import { BottomNav } from "./BottomNav";

interface AppHeaderProps {
  email?: string | null;
  subtitle?: string;
}

function initials(email?: string | null): string {
  if (!email) return "U";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export function AppHeader({ email, subtitle }: AppHeaderProps) {
  const navigate = useNavigate();
  const sub = subtitle ?? formatLongDate(todayISO());

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <header className="mx-auto flex w-full max-w-2xl items-start justify-between px-5 pt-6 pb-4 md:pt-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daylog</h1>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <BottomNav />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground hairline">
          {initials(email)}
        </div>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
