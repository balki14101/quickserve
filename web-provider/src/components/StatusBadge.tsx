const styles: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: "confirmed" | "completed" | "cancelled" }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
