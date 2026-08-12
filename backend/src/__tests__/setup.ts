import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Tests never load .env, so JWT_SECRET must be set explicitly before any
// request signs/verifies a token.
process.env.JWT_SECRET = "test-secret-do-not-use-in-production";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Wipe every collection between tests so each test starts from a clean, empty
// database instead of leaking state from the previous one.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
