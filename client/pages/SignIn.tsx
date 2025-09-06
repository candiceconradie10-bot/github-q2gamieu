import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({ title: "Signed in", description: "Welcome back!" });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err.message || "Unable to sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-black/95 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="bg-gradient-to-r from-brand-red to-red-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Link
              to="/signup"
              className="text-sm text-white/70 hover:text-white"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
