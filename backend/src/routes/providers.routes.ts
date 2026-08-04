import { Router, Request, Response } from "express";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query as { category?: string };
    const filter = category ? { category } : {};
    const providers = await ProviderProfile.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ providers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    const services = await Service.find({ providerId: provider._id });
    res.status(200).json({ provider, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    const slots = await Availability.find({ providerId: provider._id, isBooked: false }).sort({
      date: 1,
      startTime: 1,
    });
    res.status(200).json({ slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
