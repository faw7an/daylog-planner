import { Link, useLocation } from "@tanstack/react-router";
import { Home, Clock } from "lucide-react";

export function BottomNav() {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/dashboard", label: "Today", icon: Home },
    { to: "/history", label: "History", icon: Clock },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/80 backdrop-blur md:static md:border-0 md:bg-transparent md:backdrop-blur-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around md:justify-end md:gap-2">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 text-xs transition-colors md:flex-row md:flex-none md:rounded-lg md:px-3 md:py-2 md:text-sm ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
