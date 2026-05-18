import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: Register,
});

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingReg, setLoadingReg] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, setUser } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReg(true);

    try {
      const res = await api.post("/auth/register", { name, email, password });
      setUser(res.data);
      toast({ title: "Account created", description: "Welcome to Daylog!" });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast({
        title: "Error registering",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingReg(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Join Daylog</h1>
          <p className="text-zinc-400 text-sm">Create your account to start planning</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>
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
              minLength={6}
              className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            disabled={loadingReg}
          >
            {loadingReg ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-400">Already have an account? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
