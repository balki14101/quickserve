import request from "supertest";
import app from "../app";
import { User } from "../models/User";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";

// These tests exercise the public GET routes in isolation, so fixtures are
// inserted directly via the models instead of going through signup +
// POST /provider/profile (that flow is covered in provider.test.ts).
async function createProvider(businessName: string, category: string) {
  const user = await User.create({
    name: `${businessName} Owner`,
    email: `${businessName.toLowerCase().replace(/\s+/g, "-")}@example.com`,
    passwordHash: "irrelevant-for-these-tests",
    role: "provider",
    phone: "555-0000",
  });
  const profile = await ProviderProfile.create({ userId: user._id, businessName, category });
  return profile;
}

describe("GET /providers", () => {
  it("lists providers with pagination metadata", async () => {
    await createProvider("Salon A", "salon");
    await createProvider("Salon B", "salon");
    await createProvider("Repair Shop", "repair");

    const res = await request(app).get("/providers");

    expect(res.status).toBe(200);
    expect(res.body.providers).toHaveLength(3);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 3, totalPages: 1 });
  });

  it("filters by category", async () => {
    await createProvider("Salon A", "salon");
    await createProvider("Repair Shop", "repair");

    const res = await request(app).get("/providers").query({ category: "repair" });

    expect(res.status).toBe(200);
    expect(res.body.providers).toHaveLength(1);
    expect(res.body.providers[0].businessName).toBe("Repair Shop");
  });

  it("paginates with page/limit", async () => {
    await createProvider("Salon A", "salon");
    await createProvider("Salon B", "salon");
    await createProvider("Salon C", "salon");

    const res = await request(app).get("/providers").query({ page: 2, limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.providers).toHaveLength(1);
    expect(res.body.pagination).toEqual({ page: 2, limit: 1, total: 3, totalPages: 3 });
  });
});

describe("GET /providers/:id", () => {
  it("returns the provider plus its services", async () => {
    const profile = await createProvider("Salon A", "salon");
    await Service.create({ providerId: profile._id, name: "Haircut", durationMinutes: 30, price: 25 });

    const res = await request(app).get(`/providers/${profile._id}`);

    expect(res.status).toBe(200);
    expect(res.body.provider.businessName).toBe("Salon A");
    expect(res.body.services).toHaveLength(1);
  });

  it("returns 404 for a provider that doesn't exist", async () => {
    const res = await request(app).get("/providers/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("GET /providers/:id/availability", () => {
  it("only returns slots that aren't booked", async () => {
    const profile = await createProvider("Salon A", "salon");
    const service = await Service.create({
      providerId: profile._id,
      name: "Haircut",
      durationMinutes: 30,
      price: 25,
    });

    await Availability.create({
      providerId: profile._id,
      serviceId: service._id,
      date: "2026-09-01",
      startTime: "10:00",
      endTime: "10:30",
      isBooked: false,
    });
    await Availability.create({
      providerId: profile._id,
      serviceId: service._id,
      date: "2026-09-01",
      startTime: "11:00",
      endTime: "11:30",
      isBooked: true,
    });

    const res = await request(app).get(`/providers/${profile._id}/availability`);

    expect(res.status).toBe(200);
    expect(res.body.slots).toHaveLength(1);
    expect(res.body.slots[0].startTime).toBe("10:00");
  });
});
