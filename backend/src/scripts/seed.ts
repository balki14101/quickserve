import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { ProviderProfile } from "../models/ProviderProfile";
import { Service } from "../models/Service";
import { Availability } from "../models/Availability";
import { Booking } from "../models/Booking";

// Wipes the 5 collections and reloads them with a fixed, repeatable demo dataset:
// 4 providers (one per pitch category) with services and availability slots,
// 2 customers, and 3 bookings covering each status (confirmed/completed/cancelled).
// Every seeded account shares this password so you can log in as any of them.
const DEMO_PASSWORD = "Passw0rd!123";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function seed(): Promise<void> {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    ProviderProfile.deleteMany({}),
    Service.deleteMany({}),
    Availability.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Creating providers, services, and availability...");

  // --- Provider 1: Glow Salon & Spa ---
  const salonUser = await User.create({
    name: "Priya Nair",
    email: "glow.salon@quickserve.demo",
    passwordHash,
    role: "provider",
    phone: "555-1001",
  });
  const salonProfile = await ProviderProfile.create({
    userId: salonUser._id,
    businessName: "Glow Salon & Spa",
    category: "salon",
    description: "Full-service hair and beauty salon.",
    imageUrl: "",
  });
  const haircutService = await Service.create({
    providerId: salonProfile._id,
    name: "Signature Haircut",
    durationMinutes: 45,
    price: 35,
  });
  const conditioningService = await Service.create({
    providerId: salonProfile._id,
    name: "Deep Conditioning Treatment",
    durationMinutes: 30,
    price: 25,
  });
  await Availability.create({
    providerId: salonProfile._id,
    serviceId: haircutService._id,
    date: daysFromNow(2),
    startTime: "14:00",
    endTime: "14:45",
    isBooked: false,
  });
  await Availability.create({
    providerId: salonProfile._id,
    serviceId: conditioningService._id,
    date: daysFromNow(1),
    startTime: "11:00",
    endTime: "11:30",
    isBooked: false,
  });
  const confirmedSlot = await Availability.create({
    providerId: salonProfile._id,
    serviceId: haircutService._id,
    date: daysFromNow(1),
    startTime: "10:00",
    endTime: "10:45",
    isBooked: true,
  });

  // --- Provider 2: QuickFix Repairs ---
  const repairUser = await User.create({
    name: "Marcus Chen",
    email: "quickfix.repairs@quickserve.demo",
    passwordHash,
    role: "provider",
    phone: "555-1002",
  });
  const repairProfile = await ProviderProfile.create({
    userId: repairUser._id,
    businessName: "QuickFix Repairs",
    category: "repair",
    description: "Phone, laptop, and tablet repair.",
    imageUrl: "",
  });
  const phoneRepairService = await Service.create({
    providerId: repairProfile._id,
    name: "Phone Screen Repair",
    durationMinutes: 60,
    price: 60,
  });
  await Service.create({
    providerId: repairProfile._id,
    name: "Laptop Diagnostic",
    durationMinutes: 30,
    price: 20,
  });
  await Availability.create({
    providerId: repairProfile._id,
    serviceId: phoneRepairService._id,
    date: daysFromNow(1),
    startTime: "09:00",
    endTime: "10:00",
    isBooked: false,
  });
  const completedSlot = await Availability.create({
    providerId: repairProfile._id,
    serviceId: phoneRepairService._id,
    date: daysFromNow(-2),
    startTime: "09:00",
    endTime: "10:00",
    isBooked: true,
  });

  // --- Provider 3: BrightMind Tutoring ---
  const tutorUser = await User.create({
    name: "Aisha Rahman",
    email: "brightmind.tutoring@quickserve.demo",
    passwordHash,
    role: "provider",
    phone: "555-1003",
  });
  const tutorProfile = await ProviderProfile.create({
    userId: tutorUser._id,
    businessName: "BrightMind Tutoring",
    category: "tutoring",
    description: "One-on-one math and science tutoring.",
    imageUrl: "",
  });
  const mathService = await Service.create({
    providerId: tutorProfile._id,
    name: "Math Tutoring Session",
    durationMinutes: 60,
    price: 40,
  });
  await Availability.create({
    providerId: tutorProfile._id,
    serviceId: mathService._id,
    date: daysFromNow(4),
    startTime: "16:00",
    endTime: "17:00",
    isBooked: false,
  });
  // Re-opened by the cancelled booking below, so it stays isBooked: false here.
  const cancelledSlot = await Availability.create({
    providerId: tutorProfile._id,
    serviceId: mathService._id,
    date: daysFromNow(1),
    startTime: "16:00",
    endTime: "17:00",
    isBooked: false,
  });

  // --- Provider 4: PeakForm Fitness ---
  const fitnessUser = await User.create({
    name: "Devon Brooks",
    email: "peakform.fitness@quickserve.demo",
    passwordHash,
    role: "provider",
    phone: "555-1004",
  });
  const fitnessProfile = await ProviderProfile.create({
    userId: fitnessUser._id,
    businessName: "PeakForm Fitness",
    category: "fitness",
    description: "Personal training and strength coaching.",
    imageUrl: "",
  });
  const trainingService = await Service.create({
    providerId: fitnessProfile._id,
    name: "Personal Training Session",
    durationMinutes: 60,
    price: 50,
  });
  await Availability.create({
    providerId: fitnessProfile._id,
    serviceId: trainingService._id,
    date: daysFromNow(2),
    startTime: "07:00",
    endTime: "08:00",
    isBooked: false,
  });

  console.log("Creating customers and bookings...");

  const customer1 = await User.create({
    name: "Jordan Lee",
    email: "jordan.lee@quickserve.demo",
    passwordHash,
    role: "customer",
    phone: "555-2001",
  });
  const customer2 = await User.create({
    name: "Sam Patel",
    email: "sam.patel@quickserve.demo",
    passwordHash,
    role: "customer",
    phone: "555-2002",
  });

  await Booking.create({
    customerId: customer1._id,
    providerId: salonProfile._id,
    serviceId: haircutService._id,
    slotId: confirmedSlot._id,
    status: "confirmed",
  });
  await Booking.create({
    customerId: customer2._id,
    providerId: repairProfile._id,
    serviceId: phoneRepairService._id,
    slotId: completedSlot._id,
    status: "completed",
  });
  await Booking.create({
    customerId: customer1._id,
    providerId: tutorProfile._id,
    serviceId: mathService._id,
    slotId: cancelledSlot._id,
    status: "cancelled",
  });

  console.log("\nDone. Every seeded account uses the password: " + DEMO_PASSWORD);
  console.log("\nProviders:");
  console.log("  glow.salon@quickserve.demo        (Glow Salon & Spa - salon)");
  console.log("  quickfix.repairs@quickserve.demo  (QuickFix Repairs - repair)");
  console.log("  brightmind.tutoring@quickserve.demo (BrightMind Tutoring - tutoring)");
  console.log("  peakform.fitness@quickserve.demo  (PeakForm Fitness - fitness)");
  console.log("\nCustomers:");
  console.log("  jordan.lee@quickserve.demo");
  console.log("  sam.patel@quickserve.demo");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
