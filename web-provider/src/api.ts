import type { User } from "./authSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  imageUrl: string;
}

export interface Service {
  _id: string;
  providerId: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Availability {
  _id: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  _id: string;
  customerId: { _id: string; name: string; email: string; phone: string };
  serviceId: Service;
  slotId: Availability;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth

export function signup(payload: { name: string; email: string; password: string; role: string; phone: string }) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }) as Promise<{
    token: string;
    user: User;
  }>;
}

export function login(payload: { email: string; password: string }) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(payload) }) as Promise<{
    token: string;
    user: User;
  }>;
}

// Provider profile

export function getMyProfile(token: string) {
  return request("/provider/profile", {}, token) as Promise<{ profile: ProviderProfile }>;
}

export function createMyProfile(
  token: string,
  payload: { businessName: string; category: string; description?: string; imageUrl?: string }
) {
  return request("/provider/profile", { method: "POST", body: JSON.stringify(payload) }, token) as Promise<{
    profile: ProviderProfile;
  }>;
}

// Services (creation is provider-only; listing reuses the public provider-by-id route)

export function createService(token: string, payload: { name: string; durationMinutes: number; price: number }) {
  return request("/provider/services", { method: "POST", body: JSON.stringify(payload) }, token) as Promise<{
    service: Service;
  }>;
}

export function getProviderPublic(providerId: string) {
  return request(`/providers/${providerId}`) as Promise<{ provider: ProviderProfile; services: Service[] }>;
}

// Availability

export function addAvailability(
  token: string,
  payload: { serviceId: string; date: string; startTime: string; endTime: string }
) {
  return request("/provider/availability", { method: "POST", body: JSON.stringify(payload) }, token) as Promise<{
    slot: Availability;
  }>;
}

export function getProviderAvailability(providerId: string) {
  return request(`/providers/${providerId}/availability`) as Promise<{ slots: Availability[] }>;
}

// Bookings

export function getMyBookings(token: string, page = 1) {
  return request(`/provider/bookings?page=${page}`, {}, token) as Promise<{
    bookings: Booking[];
    pagination: Pagination;
  }>;
}

export function completeBooking(token: string, bookingId: string) {
  return request(`/provider/bookings/${bookingId}/complete`, { method: "PATCH" }, token) as Promise<{
    booking: Booking;
  }>;
}
