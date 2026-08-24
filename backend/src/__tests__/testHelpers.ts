import request from "supertest";
import app from "../app";
import { UserRole } from "../models/User";

let counter = 0;

// Every test file needs at least one signed-up-and-logged-in user to get a
// token to call protected routes with, so this is shared the same way
// middleware/auth.ts is shared in the app itself.
export async function signup(role: UserRole, overrides: Partial<{ name: string; phone: string }> = {}) {
  counter += 1;
  const email = `test-user-${counter}-${Date.now()}@example.com`;

  const res = await request(app).post("/auth/signup").send({
    name: overrides.name ?? "Test User",
    email,
    password: "Passw0rd!123",
    role,
    phone: overrides.phone ?? "555-0000",
  });

  return { token: res.body.token as string, userId: res.body.user.id as string, email };
}
