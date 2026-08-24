import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getMyProfile, getMyBookings, type ProviderProfile, type Booking } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { CalendarCheckIcon, ListIcon, BuildingIcon } from "../components/icons";

export function Dashboard() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await getMyProfile(token);
        setProfile(profileRes.profile);
        const bookingsRes = await getMyBookings(token);
        setBookings(bookingsRes.bookings);
      } catch {
        setNoProfile(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  if (noProfile) {
    return (
      <p className="text-sm text-slate-600">
        You haven't set up a business profile yet. Head to the Profile page to create one.
      </p>
    );
  }

  const upcoming = bookings.filter((b) => b.status === "confirmed");

  const stats = [
    { label: "Upcoming bookings", value: upcoming.length, Icon: CalendarCheckIcon },
    { label: "Total bookings", value: bookings.length, Icon: ListIcon },
    { label: "Business", value: profile?.businessName ?? "", Icon: BuildingIcon },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Here's what's happening with your business.</p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Icon className="h-4 w-4" />
            </div>
            <p className="mb-1 text-xs text-slate-500">{label}</p>
            <p className="truncate text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-sm font-medium text-slate-700">Recent bookings</p>
      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        {bookings.length === 0 && <p className="p-4 text-sm text-slate-500">No bookings yet.</p>}
        {bookings.map((b) => (
          <div key={b._id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-slate-900">{b.customerId.name}</p>
              <p className="text-xs text-slate-500">
                {b.serviceId.name} &middot; {b.slotId.date} {b.slotId.startTime}
              </p>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
