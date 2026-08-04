import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";

import authRoutes from "./routes/auth.routes";
import providersRoutes from "./routes/providers.routes";
import providerRoutes from "./routes/provider.routes";
import bookingRoutes from "./routes/booking.routes";
import customerRoutes from "./routes/customer.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/providers", providersRoutes);
app.use("/provider", providerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/customer", customerRoutes);

// Catch-all for unmatched routes. Every route above handles its own errors
// locally, so there's no global error-handling middleware here.
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`QuickServe API listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
