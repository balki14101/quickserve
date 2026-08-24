import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { logout } from "../authSlice";
import { DashboardIcon, ServicesIcon, AvailabilityIcon, BookingsIcon, ProfileIcon } from "./icons";

const links = [
  { to: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { to: "/services", label: "Services", Icon: ServicesIcon },
  { to: "/availability", label: "Availability", Icon: AvailabilityIcon },
  { to: "/bookings", label: "Bookings", Icon: BookingsIcon },
  { to: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex h-screen w-52 flex-col justify-between border-r border-slate-200 bg-white p-4">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-semibold text-white">
            Q
          </div>
          <span className="text-sm font-semibold text-slate-900">QuickServe</span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-100 px-2 pt-3">
        <p className="mb-2 truncate text-xs font-medium text-slate-700">{user?.name}</p>
        <button onClick={() => dispatch(logout())} className="text-xs text-slate-500 hover:text-slate-800">
          Log out
        </button>
      </div>
    </div>
  );
}
