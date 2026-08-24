import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getMyProfile, createMyProfile, type ProviderProfile } from "../api";
import { Button, Input } from "../components/ui";

export function Profile() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile(token)
      .then((res) => setProfile(res.profile))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await createMyProfile(token, { businessName, category, description });
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (profile) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mb-6 text-sm text-slate-500">Your public business details.</p>
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-lg font-medium text-slate-900">{profile.businessName}</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Category</p>
              <p className="capitalize text-slate-900">{profile.category}</p>
            </div>
            <div>
              <p className="text-slate-500">Description</p>
              <p className="text-slate-900">{profile.description || "No description yet."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Set up your business profile</h1>
      <p className="mb-6 text-sm text-slate-500">Customers will see this before booking with you.</p>
      <form onSubmit={handleCreate} className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label className="mb-1 block text-sm text-slate-700">Business name</label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-slate-700">Category</label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="salon, repair, tutoring, fitness..."
            required
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create profile"}
        </Button>
      </form>
    </div>
  );
}
