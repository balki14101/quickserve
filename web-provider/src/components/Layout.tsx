import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-900">{user?.name}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-medium text-indigo-700">
            {initials}
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
