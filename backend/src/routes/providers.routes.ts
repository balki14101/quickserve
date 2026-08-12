import { Router, Request, Response } from "express";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query as { category?: string };
    const filter = category ? { category } : {};

    // page/limit default to 1/10 for anything missing, non-numeric, or out of range; limit caps at 50.
    const page = Number.isInteger(Number(req.query.page)) && Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit =
      Number.isInteger(Number(req.query.limit)) && Number(req.query.limit) > 0
        ? Math.min(Number(req.query.limit), 50)
        : 10;
    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      ProviderProfile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProviderProfile.countDocuments(filter),
    ]);

    res.status(200).json({ providers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
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
