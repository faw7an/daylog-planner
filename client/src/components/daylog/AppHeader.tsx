import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSheet } from "./ProfileSheet";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function AppHeader() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const initial = user
    ? (user.name || user.email).charAt(0).toUpperCase()
    : "";

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : "there";

  async function handleLogout() {
    await logout();
    setProfileOpen(false);
  }

  return (
    <>
      <header className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-lg text-zinc-400 font-normal">
            {getGreeting()}, <span className="text-white font-semibold">{displayName}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{date}</p>
        </div>

        <button
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile"
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-medium border border-white/10 hover:border-white/20 transition-colors"
        >
          {initial || "?"}
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
