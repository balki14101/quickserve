import { Router, Request, Response } from "express";
import { ProviderProfile, IProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireRole("provider"));

// Every route below needs the logged-in provider's own profile to scope its data.
function getOwnProviderProfile(userId: string): Promise<IProviderProfile | null> {
  return ProviderProfile.findOne({ userId });
}

router.post("/profile", async (req: Request, res: Response) => {
  try {
    const existing = await getOwnProviderProfile(req.user!.id);
    if (existing) {
      res.status(409).json({ error: "Provider profile already exists" });
      return;
    }

    const { businessName, category, description, imageUrl } = req.body as {
      businessName?: string;
      category?: string;
      description?: string;
      imageUrl?: string;
    };

    if (!businessName || !category) {
      res.status(400).json({ error: "businessName and category are required" });
      return;
    }

    const profile = await ProviderProfile.create({
      userId: req.user!.id,
      businessName,
      category,
      description,
      imageUrl,
    });

    res.status(201).json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", async (req: Request, res: Response) => {
  try {
    const profile = await getOwnProviderProfile(req.user!.id);
    if (!profile) {
      res.status(404).json({ error: "No provider profile exists for this account yet" });
      return;
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/services", async (req: Request, res: Response) => {
  try {
    const profile = await getOwnProviderProfile(req.user!.id);
    if (!profile) {
      res.status(404).json({
        error: "No provider profile exists for this account yet. Create one before adding services or availability.",
      });
      return;
    }

    const { name, durationMinutes, price } = req.body as {
      name?: string;
      durationMinutes?: number;
      price?: number;
    };

    if (!name || durationMinutes === undefined || price === undefined) {
      res.status(400).json({ error: "name, durationMinutes and price are all required" });
      return;
    }

    const service = await Service.create({ providerId: profile._id, name, durationMinutes, price });
    res.status(201).json({ service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/availability", async (req: Request, res: Response) => {
  try {
    const profile = await getOwnProviderProfile(req.user!.id);
    if (!profile) {
      res.status(404).json({
        error: "No provider profile exists for this account yet. Create one before adding services or availability.",
      });
      return;
    }

    const { serviceId, date, startTime, endTime } = req.body as {
      serviceId?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
    };

    if (!serviceId || !date || !startTime || !endTime) {
      res.status(400).json({ error: "serviceId, date, startTime and endTime are all required" });
      return;
    }

    const service = await Service.findOne({ _id: serviceId, providerId: profile._id });
    if (!service) {
      res.status(404).json({ error: "Service not found for this provider" });
      return;
    }

    const slot = await Availability.create({ providerId: profile._id, serviceId, date, startTime, endTime });
    res.status(201).json({ slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings", async (req: Request, res: Response) => {
  try {
    const profile = await getOwnProviderProfile(req.user!.id);
    if (!profile) {
      res.status(404).json({
        error: "No provider profile exists for this account yet. Create one before adding services or availability.",
      });
      return;
    }

    const bookings = await Booking.find({ providerId: profile._id })
      .populate("customerId", "name email phone")
      .populate("serviceId")
      .populate("slotId")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
