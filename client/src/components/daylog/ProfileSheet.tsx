import { X, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileSheet({ open, onClose, onLogout }: Props) {
  const { user } = useAuth();

  if (!open) return null;

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-card p-6 hairline md:rounded-2xl"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xl font-medium border border-white/10">
            {initial}
          </div>
          <div>
            <p className="font-semibold">{user?.name || "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1 border-t border-white/5 pt-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
