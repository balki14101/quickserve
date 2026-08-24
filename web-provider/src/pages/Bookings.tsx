import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getMyBookings, completeBooking, type Booking } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui";

export function Bookings() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState("");

  useEffect(() => {
    setLoading(true);
    getMyBookings(token, page)
      .then((res) => {
        setBookings(res.bookings);
        setTotalPages(res.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [token, page]);

  async function handleComplete(bookingId: string) {
    setCompletingId(bookingId);
    try {
      // The complete endpoint returns the raw (unpopulated) booking document,
      // so update just the status locally instead of replacing the whole
      // object — otherwise customer/service/slot details would disappear.
      await completeBooking(token, bookingId);
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: "completed" } : b)));
    } finally {
      setCompletingId("");
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-slate-900">Bookings</h1>
      <p className="mb-6 text-sm text-slate-500">Appointments customers have made with you.</p>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}

      {!loading && bookings.length > 0 && (
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
          {bookings.map((b) => (
            <div key={b._id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-slate-900">{b.customerId.name}</p>
                <p className="text-xs text-slate-500">
                  {b.serviceId.name} &middot; {b.slotId.date} {b.slotId.startTime}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.status === "confirmed" && (
                  <Button
                    className="bg-slate-900 px-3 py-1 text-xs hover:bg-slate-800"
                    disabled={completingId === b._id}
                    onClick={() => handleComplete(b._id)}
                  >
                    {completingId === b._id ? "Saving..." : "Mark complete"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
