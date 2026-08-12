import request from "supertest";
import app from "../app";
import { signup } from "./testHelpers";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";

async function createOpenSlot() {
  const { userId: providerUserId } = await signup("provider");
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
  return slot;
}

describe("POST /bookings", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/bookings").send({ slotId: "000000000000000000000000" });
    expect(res.status).toBe(401);
  });

  it("rejects a provider token", async () => {
    const { token } = await signup("provider");
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ slotId: "000000000000000000000000" });
    expect(res.status).toBe(403);
  });

  it("rejects a request missing slotId", async () => {
    const { token } = await signup("customer");
    const res = await request(app).post("/bookings").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 for a slot that doesn't exist", async () => {
    const { token } = await signup("customer");
    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ slotId: "000000000000000000000000" });
    expect(res.status).toBe(404);
  });

  it("books an open slot and marks it as booked", async () => {
    const slot = await createOpenSlot();
    const { token } = await signup("customer");

    const res = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ slotId: slot._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe("confirmed");

    const updatedSlot = await Availability.findById(slot._id);
    expect(updatedSlot?.isBooked).toBe(true);
  });

  it("rejects a second booking on an already-booked slot with 409", async () => {
    const slot = await createOpenSlot();
    const { token: customer1 } = await signup("customer");
    const { token: customer2 } = await signup("customer");

    const first = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${customer1}`)
      .send({ slotId: slot._id.toString() });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${customer2}`)
      .send({ slotId: slot._id.toString() });
    expect(second.status).toBe(409);

    const bookingCount = await Booking.countDocuments({ slotId: slot._id });
    expect(bookingCount).toBe(1);
  });

  // The important one: proves the findOneAndUpdate slot lock is actually
  // atomic under real concurrency, not just correct when called sequentially.
  it("under concurrent requests for the same slot, exactly one booking wins", async () => {
    const slot = await createOpenSlot();
    const { token: customer1 } = await signup("customer");
    const { token: customer2 } = await signup("customer");

    const [res1, res2] = await Promise.all([
      request(app).post("/bookings").set("Authorization", `Bearer ${customer1}`).send({ slotId: slot._id.toString() }),
      request(app).post("/bookings").set("Authorization", `Bearer ${customer2}`).send({ slotId: slot._id.toString() }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const bookingCount = await Booking.countDocuments({ slotId: slot._id });
    expect(bookingCount).toBe(1);

    const updatedSlot = await Availability.findById(slot._id);
    expect(updatedSlot?.isBooked).toBe(true);
  });
});
