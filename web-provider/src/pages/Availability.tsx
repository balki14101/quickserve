import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getMyProfile, getProviderPublic, getProviderAvailability, addAvailability, type Service, type Availability as Slot } from "../api";
import { Button, Input } from "../components/ui";

export function Availability() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const { profile } = await getMyProfile(token);
      const [{ services }, { slots }] = await Promise.all([
        getProviderPublic(profile._id),
        getProviderAvailability(profile._id),
      ]);
      setServices(services);
      setSlots(slots);
      if (services.length > 0) setServiceId(services[0]._id);
    } catch {
      setNoProfile(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addAvailability(token, { serviceId, date, startTime, endTime });
      setDate("");
      setStartTime("");
      setEndTime("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add slot");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (noProfile) {
    return <p className="text-sm text-slate-600">Set up your business profile first, on the Profile page.</p>;
  }

  if (services.length === 0) {
    return <p className="text-sm text-slate-600">Add a service first, on the Services page.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Availability</h1>
      <p className="mb-6 text-sm text-slate-500">Open time slots customers can book.</p>
      <div className="mb-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {slots.length === 0 && <p className="p-4 text-sm text-slate-500">No open slots — add one below.</p>}
        {slots.map((s) => (
          <div key={s._id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-slate-900">
              {s.date} &middot; {s.startTime}&ndash;{s.endTime}
            </span>
            <span className="text-slate-500">{services.find((sv) => sv._id === s.serviceId)?.name}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-medium text-slate-900">Add a slot</p>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-slate-700">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-slate-700">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-slate-700">Start time</label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm text-slate-700">End time</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add slot"}
        </Button>
      </form>
    </div>
  );
}
