import type { User } from "./authSlice";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://quickserve-lrj2.onrender.com";

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export interface Provider {
  _id: string;
  businessName: string;
  category: string;
  description: string;
}

export interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Slot {
  _id: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  _id: string;
  providerId: Provider;
  serviceId: Service;
  slotId: Slot;
  status: "confirmed" | "cancelled" | "completed";
}

type Session = { token: string; user: User };

export const login = (payload: { email: string; password: string }): Promise<Session> =>
  request("/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const signup = (payload: { name: string; email: string; phone: string; password: string }): Promise<Session> =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ ...payload, role: "customer" }) });

export const getProviders = (): Promise<{ providers: Provider[] }> => request("/providers?limit=50");

export const getProvider = (id: string): Promise<{ provider: Provider; services: Service[] }> =>
  request(`/providers/${id}`);

export const getSlots = (id: string): Promise<{ slots: Slot[] }> => request(`/providers/${id}/availability`);

export const bookSlot = (token: string, slotId: string) =>
  request("/bookings", { method: "POST", body: JSON.stringify({ slotId }) }, token);

export const getMyBookings = (token: string): Promise<{ bookings: Booking[] }> =>
  request("/customer/bookings?limit=50", {}, token);

export const cancelBooking = (token: string, bookingId: string) =>
  request(`/customer/bookings/${bookingId}/cancel`, { method: "PATCH" }, token);

export const deleteAccount = (token: string, password: string) =>
  request("/customer/account", { method: "DELETE", body: JSON.stringify({ password }) }, token);
