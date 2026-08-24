import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup as signupApi } from "../api";
import { login as loginAction } from "../authSlice";
import { Button, Input } from "../components/ui";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      const data = await signupApi({ name, email, password, phone, role: "provider" });
      dispatch(loginAction(data));
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            List your services. Fill your calendar.
          </p>
          <p className="max-w-sm text-sm text-indigo-100">
            Join salons, trainers, tutors, and repair shops already booking through QuickServe.
          </p>
        </div>
        <p className="text-xs text-indigo-200">© 2026 QuickServe</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Create your account</h1>
          <p className="mb-6 text-sm text-slate-500">Set up your provider account in a minute</p>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-700">Your name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-700">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm text-slate-700">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
