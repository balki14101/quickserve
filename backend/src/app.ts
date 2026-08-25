import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import providersRoutes from "./routes/providers.routes";
import providerRoutes from "./routes/provider.routes";
import bookingRoutes from "./routes/booking.routes";
import customerRoutes from "./routes/customer.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://web-provider-rmws.onrender.com",
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/providers", providersRoutes);
app.use("/provider", providerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/customer", customerRoutes);

// Catch-all for unmatched routes; each route handles its own errors locally.
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

export default app;
