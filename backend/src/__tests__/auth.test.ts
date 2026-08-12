import request from "supertest";
import app from "../app";

describe("POST /auth/signup", () => {
  it("creates a customer and returns a token", async () => {
    const res = await request(app).post("/auth/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "Passw0rd!123",
      role: "customer",
      phone: "555-0101",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: "Alice", email: "alice@example.com", role: "customer" });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a signup missing required fields", async () => {
    const res = await request(app).post("/auth/signup").send({ email: "bob@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid role", async () => {
    const res = await request(app).post("/auth/signup").send({
      name: "Bob",
      email: "bob@example.com",
      password: "Passw0rd!123",
      role: "admin",
      phone: "555-0102",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email with 409", async () => {
    const payload = {
      name: "Carol",
      email: "carol@example.com",
      password: "Passw0rd!123",
      role: "customer",
      phone: "555-0103",
    };

    const first = await request(app).post("/auth/signup").send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post("/auth/signup").send(payload);
    expect(second.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/auth/signup").send({
      name: "Dana",
      email: "dana@example.com",
      password: "Passw0rd!123",
      role: "provider",
      phone: "555-0104",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "dana@example.com", password: "Passw0rd!123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.role).toBe("provider");
  });

  it("rejects a wrong password with 401", async () => {
    await request(app).post("/auth/signup").send({
      name: "Eve",
      email: "eve@example.com",
      password: "Passw0rd!123",
      role: "customer",
      phone: "555-0105",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "eve@example.com", password: "WrongPassword!" });

    expect(res.status).toBe(401);
  });

  it("rejects an email that was never signed up with 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "Passw0rd!123" });

    expect(res.status).toBe(401);
  });
});
