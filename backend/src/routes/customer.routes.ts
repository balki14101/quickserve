import { Router, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/bookings", authenticate, requireRole("customer"), async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ customerId: req.user!.id })
      .populate("providerId")
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
