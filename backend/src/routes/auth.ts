import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

// ✅ Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Demo credentials (used to auto-provision a user so the demo login works)
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "hire-me@anshumat.org";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "HireMe@2025!";

// ✅ Ensure the demo user exists so the default creds always work
async function ensureDemoUser(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    await prisma.user.create({
      data: { email: DEMO_EMAIL, password: hashedPassword },
    });
    console.log("✅ Demo user provisioned");
  }
}

// ✅ Register user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsed.error.issues.map(({ message }) => message),
      });
    }

    const { email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
});

// ✅ Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsed.error.issues.map(({ message }) => message),
      });
    }

    const { email, password } = parsed.data;

    // Make sure demo user exists so the default credentials work
    await ensureDemoUser();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // ✅ Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Failed to login user" });
  }
});

// ✅ Get all users
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, createdAt: true },
    });
    return res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Fetch users error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

export default router;