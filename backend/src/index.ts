import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import budgetRoutes from "./routes/budget";
import prisma from "./lib/prisma";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://your-frontend.vercel.app",
  credentials: true
}));

async function ensureDemoUser() {
  const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "hire-me@anshumat.org";
  const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "HireMe@2025!";

  try {
    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
      await prisma.user.create({
        data: { email: DEMO_EMAIL, password: hashedPassword },
      });
      console.log("✅ Demo user provisioned:", DEMO_EMAIL);
    }
  } catch (error) {
    console.error("⚠️ Could not ensure demo user:", error);
  }
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/budget", budgetRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Global error:", err);
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  await ensureDemoUser();
});