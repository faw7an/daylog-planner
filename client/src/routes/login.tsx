import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const { toast } = useToast();
  const { loading, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data);
      toast({ title: "Signed in", description: "Welcome back!" });
      await new Promise((r) => setTimeout(r, 100));
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast({
        title: "Error signing in",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Daylog</h1>
          <p className="text-zinc-400 text-sm">Welcome back to your daily planner</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            disabled={loadingLogin}
          >
            {loadingLogin ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-400">Don't have an account? </span>
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
