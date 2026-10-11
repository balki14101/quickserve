import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Booking } from "../models/Booking";
import { Availability } from "../models/Availability";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/bookings", authenticate, requireRole("customer"), async (req: Request, res: Response) => {
  try {
    // page/limit default to 1/10 for anything missing, non-numeric, or out of range; limit caps at 50.
    const page = Number.isInteger(Number(req.query.page)) && Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit =
      Number.isInteger(Number(req.query.limit)) && Number(req.query.limit) > 0
        ? Math.min(Number(req.query.limit), 50)
        : 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ customerId: req.user!.id })
        .populate("providerId")
        .populate("serviceId")
        .populate("slotId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ customerId: req.user!.id }),
    ]);

    res.status(200).json({ bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/bookings/:id/cancel",
  authenticate,
  requireRole("customer"),
  async (req: Request, res: Response) => {
    try {
      const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user!.id });
      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      if (booking.status !== "confirmed") {
        res.status(400).json({ error: "Only confirmed bookings can be cancelled" });
        return;
      }

      booking.status = "cancelled";
      await booking.save();

      // Re-open the slot so someone else can book it.
      await Availability.findByIdAndUpdate(booking.slotId, { $set: { isBooked: false } });

      res.status(200).json({ booking });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/account", authenticate, requireRole("customer"), async (req: Request, res: Response) => {
  try {
    const { password } = req.body as { password?: string };
    if (!password) {
      res.status(400).json({ error: "password is required" });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    const bookings = await Booking.find({ customerId: user._id });
    const heldSlotIds = bookings.filter((b) => b.status === "confirmed").map((b) => b.slotId);

    // Slots held by upcoming bookings go back on sale before the bookings are removed.
    await Availability.updateMany({ _id: { $in: heldSlotIds } }, { $set: { isBooked: false } });
    await Booking.deleteMany({ customerId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
