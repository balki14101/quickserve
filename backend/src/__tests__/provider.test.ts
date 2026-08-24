import request from "supertest";
import app from "../app";
import { signup } from "./testHelpers";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";

describe("POST /provider/profile", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/provider/profile").send({ businessName: "X", category: "salon" });
    expect(res.status).toBe(401);
  });

  it("rejects a customer token", async () => {
    const { token } = await signup("customer");
    const res = await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "X", category: "salon" });
    expect(res.status).toBe(403);
  });

  it("rejects a request missing businessName/category", async () => {
    const { token } = await signup("provider");
    const res = await request(app).post("/provider/profile").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("creates a profile for the logged-in provider", async () => {
    const { token, userId } = await signup("provider");
    const res = await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    expect(res.status).toBe(201);
    expect(res.body.profile.userId).toBe(userId);
  });

  it("rejects creating a second profile for the same provider with 409", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon 2", category: "salon" });

    expect(res.status).toBe(409);
  });
});

describe("GET /provider/profile", () => {
  it("returns 404 before a profile exists", async () => {
    const { token } = await signup("provider");
    const res = await request(app).get("/provider/profile").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("returns the profile after it's created", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app).get("/provider/profile").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.businessName).toBe("Glow Salon");
  });
});

describe("POST /provider/services", () => {
  it("returns 404 when the provider has no profile yet", async () => {
    const { token } = await signup("provider");
    const res = await request(app)
      .post("/provider/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", durationMinutes: 30, price: 25 });
    expect(res.status).toBe(404);
  });

  it("creates a service once a profile exists", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app)
      .post("/provider/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", durationMinutes: 30, price: 25 });

    expect(res.status).toBe(201);
    expect(res.body.service.name).toBe("Haircut");
  });
});

describe("POST /provider/availability", () => {
  it("returns 404 for a serviceId that doesn't belong to this provider", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app)
      .post("/provider/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ serviceId: "000000000000000000000000", date: "2026-09-01", startTime: "10:00", endTime: "10:30" });

    expect(res.status).toBe(404);
  });

  it("creates an availability slot", async () => {
    const { token } = await signup("provider");
    const profileRes = await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });
    const serviceRes = await request(app)
      .post("/provider/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", durationMinutes: 30, price: 25 });

    const res = await request(app)
      .post("/provider/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        serviceId: serviceRes.body.service._id,
        date: "2026-09-01",
        startTime: "10:00",
        endTime: "10:30",
      });

    expect(res.status).toBe(201);
    expect(res.body.slot.providerId).toBe(profileRes.body.profile._id);
    expect(res.body.slot.isBooked).toBe(false);
  });
});

describe("GET /provider/bookings", () => {
  it("returns an empty paginated list when there are no bookings", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app).get("/provider/bookings").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings).toEqual([]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });
});

describe("PATCH /provider/bookings/:id/complete", () => {
  it("returns 404 for a booking that doesn't belong to this provider", async () => {
    const { token } = await signup("provider");
    await request(app)
      .post("/provider/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Glow Salon", category: "salon" });

    const res = await request(app)
      .patch("/provider/bookings/000000000000000000000000/complete")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("marks a confirmed booking as completed", async () => {
    const { token: providerToken, userId: providerUserId } = await signup("provider");
    const { userId: customerUserId } = await signup("customer");

    const profile = await ProviderProfile.create({
      userId: providerUserId,
      businessName: "Glow Salon",
      category: "salon",
    });
    const service = await Service.create({
      providerId: profile._id,
      name: "Haircut",
      durationMinutes: 30,
      price: 25,
    });
    const slot = await Availability.create({
      providerId: profile._id,
      serviceId: service._id,
      date: "2026-09-01",
      startTime: "10:00",
      endTime: "10:30",
      isBooked: true,
    });
    const booking = await Booking.create({
      customerId: customerUserId,
      providerId: profile._id,
      serviceId: service._id,
      slotId: slot._id,
      status: "confirmed",
    });

    const res = await request(app)
      .patch(`/provider/bookings/${booking._id}/complete`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("completed");
  });

  it("rejects completing a booking that isn't confirmed", async () => {
    const { token: providerToken, userId: providerUserId } = await signup("provider");
    const { userId: customerUserId } = await signup("customer");

    const profile = await ProviderProfile.create({
      userId: providerUserId,
      businessName: "Glow Salon",
      category: "salon",
    });
    const service = await Service.create({
      providerId: profile._id,
      name: "Haircut",
      durationMinutes: 30,
      price: 25,
    });
    const slot = await Availability.create({
      providerId: profile._id,
      serviceId: service._id,
      date: "2026-09-01",
      startTime: "10:00",
      endTime: "10:30",
      isBooked: false,
    });
    const booking = await Booking.create({
      customerId: customerUserId,
      providerId: profile._id,
      serviceId: service._id,
      slotId: slot._id,
      status: "cancelled",
    });

    const res = await request(app)
      .patch(`/provider/bookings/${booking._id}/complete`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(400);
  });
});
