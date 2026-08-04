import { Router, Request, Response } from "express";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, requireRole("customer"), async (req: Request, res: Response) => {
  try {
    const { slotId } = req.body as { slotId?: string };

    if (!slotId) {
      res.status(400).json({ error: "slotId is required" });
      return;
    }

    // Atomically claim the slot: only succeeds if isBooked is still false.
    // This prevents two simultaneous requests from double-booking the same slot.
    const slot = await Availability.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );

    if (!slot) {
      const exists = await Availability.findById(slotId);
      if (!exists) {
        res.status(404).json({ error: "Slot not found" });
        return;
      }
      res.status(409).json({ error: "This slot has already been booked. Please choose another slot." });
      return;
    }

    try {
      const booking = await Booking.create({
        customerId: req.user!.id,
        providerId: slot.providerId,
        serviceId: slot.serviceId,
        slotId: slot._id,
        status: "confirmed",
      });

      res.status(201).json({ booking });
    } catch (err) {
      // Roll back the slot claim if booking creation unexpectedly fails.
      await Availability.findByIdAndUpdate(slot._id, { $set: { isBooked: false } });
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
