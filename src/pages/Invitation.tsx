import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { auth } from "../lib/supabase";

export default function Invitation() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const prepareSession = async () => {
      setError(null);

      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const code = params.get("code");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error: exchangeError } = await auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        }

        const { data } = await auth.getSession();
        if (!data.session) {
          setError("This invitation or reset link is invalid or has expired. Please request a new link.");
        }
      } catch (err: any) {
        setError(err.message || "Unable to open this invitation link.");
      } finally {
        setLoading(false);
      }
    };

    prepareSession();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Password saved successfully. Redirecting to admin...");
      window.setTimeout(() => navigate("/admin/general"), 900);
    } catch (err: any) {
      setError(err.message || "Unable to save password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-academic-surface chemistry-grid p-5">
      <form onSubmit={handleSubmit} className="editorial-card w-full max-w-md rounded-2xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="editorial-heading mb-2 flex items-center justify-center text-3xl">
            <KeyRound className="mr-3 text-academic-brand" size={28} />
            Set Password
          </h1>
          <p className="text-sm font-medium text-academic-muted">
            Complete your admin invitation or password reset.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-academic-brand">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-academic-muted" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-academic-border bg-academic-bg p-3 pr-10 text-academic-text transition focus:border-academic-brand focus:outline-none focus:ring-1 focus:ring-academic-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-academic-muted hover:text-academic-brand"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-academic-muted" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-academic-border bg-academic-bg p-3 text-academic-text transition focus:border-academic-brand focus:outline-none focus:ring-1 focus:ring-academic-brand"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || saving || !!message}
          className="mt-8 flex w-full items-center justify-center rounded-lg bg-academic-brand px-4 py-3 font-bold text-white shadow-sm transition hover:bg-academic-brand/90 disabled:opacity-70"
        >
          {saving ? <Loader2 className="mr-2 animate-spin" size={20} /> : null}
          Save Password
        </button>
      </form>
    </div>
  );
}
