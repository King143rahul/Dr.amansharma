import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/supabase";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    
    try {
      // Handle remember me preference
      const { error } = await auth.signInWithPassword({ email, password });
        
        if (!error) {
        navigate("/admin/bio");
      } else {
        setError(error?.message || 'Login failed');
        }
      } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    setResetLoading(true);
    setError(null);
    setMsg(null);
    try {
      const { error } = await auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/invite`,
      });
      if (error) throw error;
      setMsg("Password reset link sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
    }
    setResetLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-academic-surface chemistry-grid p-6">
      <form
        onSubmit={handleSubmit}
        className="editorial-card w-full max-w-md p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="editorial-heading text-3xl mb-2 flex items-center justify-center">
            <LogIn className="mr-3 text-academic-brand" size={28} /> Admin Access
          </h2>
          <p className="text-academic-muted font-sans text-sm">Sign in to manage your portfolio</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-academic-bg border border-academic-border text-academic-text focus:outline-none focus:border-academic-brand focus:ring-1 focus:ring-academic-brand transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-academic-muted mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pr-10 rounded-lg bg-academic-bg border border-academic-border text-academic-text focus:outline-none focus:border-academic-brand focus:ring-1 focus:ring-academic-brand transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-academic-muted hover:text-academic-brand"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center text-sm text-academic-muted cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 rounded border-academic-border text-academic-brand focus:ring-academic-brand"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-sm font-bold text-academic-brand hover:underline"
          >
            {resetLoading ? "Sending..." : "Forgot Password?"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        {msg && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 flex items-center justify-center w-full bg-academic-brand text-white font-bold py-3 px-4 rounded-lg hover:bg-academic-brand/90 transition shadow-sm disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          Sign In
        </button>
      </form>
    </div>
  );
}
