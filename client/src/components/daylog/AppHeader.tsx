import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSheet } from "./ProfileSheet";

export function AppHeader() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  async function handleLogout() {
    await logout();
    setProfileOpen(false);
  }

  return (
    <>
      <header className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Daylog</h1>
          <p className="text-zinc-400 text-sm mt-1">{date}</p>
        </div>

        <button
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-medium border border-white/10 hover:border-white/20 transition-colors"
        >
          {initial}
        </button>
      </header>

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
