import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginApi } from "../api";
import { login as loginAction } from "../authSlice";
import { Button, Input } from "../components/ui";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      if (data.user.role !== "provider") {
        setError("This dashboard is for providers only.");
        return;
      }
      dispatch(loginAction(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-indigo-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-sm font-semibold">
            Q
          </div>
          <span className="text-lg font-semibold">QuickServe</span>
        </div>
        <div>
          <p className="mb-3 max-w-sm text-3xl font-semibold leading-snug text-balance">
            Run your business, not your spreadsheets.
          </p>
          <p className="max-w-sm text-sm text-indigo-100">
            Manage services, availability, and bookings from one dashboard.
          </p>
        </div>
        <p className="text-xs text-indigo-200">© 2026 QuickServe</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-500">Sign in to your provider dashboard</p>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm text-slate-700">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500">
            New provider?{" "}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
