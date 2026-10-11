import request from "supertest";
import app from "../app";
import { signup } from "./testHelpers";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";
import { User } from "../models/User";

async function createConfirmedBooking(customerUserId: string) {
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
    isBooked: true,
  });
  const booking = await Booking.create({
    customerId: customerUserId,
    providerId: profile._id,
    serviceId: service._id,
    slotId: slot._id,
    status: "confirmed",
  });
  return { booking, slot };
}

describe("GET /customer/bookings", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/customer/bookings");
    expect(res.status).toBe(401);
  });

  it("only returns the logged-in customer's own bookings", async () => {
    const { token: token1, userId: userId1 } = await signup("customer");
    const { userId: userId2 } = await signup("customer");

    await createConfirmedBooking(userId1);
    await createConfirmedBooking(userId2);

    const res = await request(app).get("/customer/bookings").set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe("PATCH /customer/bookings/:id/cancel", () => {
  it("returns 404 for a booking that belongs to someone else", async () => {
    const { token: token1 } = await signup("customer");
    const { userId: userId2 } = await signup("customer");
    const { booking } = await createConfirmedBooking(userId2);

    const res = await request(app)
      .patch(`/customer/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(404);
  });

  it("cancels a confirmed booking and re-opens its slot", async () => {
    const { token, userId } = await signup("customer");
    const { booking, slot } = await createConfirmedBooking(userId);

    const res = await request(app)
      .patch(`/customer/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("cancelled");

    const updatedSlot = await Availability.findById(slot._id);
    expect(updatedSlot?.isBooked).toBe(false);
  });

  it("rejects cancelling a booking that's already cancelled", async () => {
    const { token, userId } = await signup("customer");
    const { booking } = await createConfirmedBooking(userId);

    const first = await request(app)
      .patch(`/customer/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app)
      .patch(`/customer/bookings/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(second.status).toBe(400);
  });
});

describe("DELETE /customer/account", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).delete("/customer/account").send({ password: "Passw0rd!123" });
    expect(res.status).toBe(401);
  });

  it("rejects a provider token", async () => {
    const { token } = await signup("provider");
    const res = await request(app)
      .delete("/customer/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "Passw0rd!123" });
    expect(res.status).toBe(403);
  });

  it("requires the password", async () => {
    const { token } = await signup("customer");
    const res = await request(app).delete("/customer/account").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("rejects a wrong password and keeps the account", async () => {
    const { token, userId } = await signup("customer");
    const res = await request(app)
      .delete("/customer/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "WrongPassword!" });

    expect(res.status).toBe(401);
    expect(await User.findById(userId)).not.toBeNull();
  });

  it("deletes the user and bookings, re-opens held slots, and blocks login", async () => {
    const { token, userId, email } = await signup("customer");
    const { slot } = await createConfirmedBooking(userId);

    const res = await request(app)
      .delete("/customer/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "Passw0rd!123" });

    expect(res.status).toBe(200);
    expect(await User.findById(userId)).toBeNull();
    expect(await Booking.countDocuments({ customerId: userId })).toBe(0);
    expect((await Availability.findById(slot._id))?.isBooked).toBe(false);

    const login = await request(app).post("/auth/login").send({ email, password: "Passw0rd!123" });
    expect(login.status).toBe(401);
  });
});
