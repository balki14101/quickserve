import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getMyProfile, getProviderPublic, createService, type Service } from "../api";
import { Button, Input } from "../components/ui";

export function Services() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    setLoading(true);
    try {
      const { profile } = await getMyProfile(token);
      const { services } = await getProviderPublic(profile._id);
      setServices(services);
    } catch {
      setNoProfile(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createService(token, {
        name,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
      });
      setName("");
      setDurationMinutes("30");
      setPrice("");
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create service");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (noProfile) {
    return <p className="text-sm text-slate-600">Set up your business profile first, on the Profile page.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Services</h1>
      <p className="mb-6 text-sm text-slate-500">What customers can book with you.</p>

      <div className="mb-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {services.length === 0 && <p className="p-4 text-sm text-slate-500">No services yet — add one below.</p>}
        {services.map((s) => (
          <div key={s._id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500">{s.durationMinutes} min</p>
            </div>
            <p className="text-sm font-medium text-slate-900">${s.price}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-medium text-slate-900">Add a service</p>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-slate-700">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-slate-700">Duration (min)</label>
            <Input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm text-slate-700">Price ($)</label>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add service"}
        </Button>
      </form>
    </div>
  );
}
