import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { User, UserRole } from "../models/User";

const router = Router();

const SALT_ROUNDS = 10;

function signToken(id: string, role: UserRole): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn });
}

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      phone?: string;
    };

    if (!name || !email || !password || !role || !phone) {
      res.status(400).json({ error: "name, email, password, role and phone are all required" });
      return;
    }

    if (role !== "customer" && role !== "provider") {
      res.status(400).json({ error: "role must be either 'customer' or 'provider'" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, role, phone });
    const token = signToken(user._id.toString(), user.role);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user._id.toString(), user.role);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
